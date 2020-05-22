import app from '../../src/server';
import DB from '../../src/models';
import express = require('express');
import { Router } from 'express';
import * as utils from "../utils/utils";

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const {expect} = chai;

const APIKEY = '7718330d2794406c980bdbded6c9dc1d';
const source = `
          #include <iostream>
          using namespace std;
          int main () {
              char in[20];
              cin>>in;
              cout<<in;
              return 0;
          }`;
const stdin = 'Success';
const expectedOutput = 'Success';

describe('POST api/runs', () => {
    before(async () => {
        await DB.apikeys.create({
            id: 1,
            key: APIKEY,
            whitelist_domains: ['*'],
            whitelist_ips: ['*']
        });
        await DB.langs.create({
            lang_slug: 'cpp',
            lang_name: 'C++',
            lang_version: '11'
        });
        await utils.setupMockQueue()
    });
    after(utils.truncateTables);


    it('should throw 403 error if API Key is absent', async () => {

        const res = await chai.request(app).post(`/api/runs`);

        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('No API Key in request');
    });

    it('should throw 404 error if GET request is made', async () => {
        const res = await chai.request(app).get(`/api/runs`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        });
        expect(res.status).to.equal(404);
    });

    it('should throw 400 error when params are not sent along with the POST request', async () => {
        const res = await chai.request(app).post(`/api/runs`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send({});

        expect(res.status).to.equal(400);
        expect(res.body.err.message).to.equal('"lang" is required');
    });

    it('should throw error for incorrect language', async () => {
        const params = {
            source: (new Buffer(source).toString('base64')),
            lang: 'abcd',
            stdin: (new Buffer(stdin).toString('base64')),
            mode: 'sync'
        };

        const res = await chai.request(app).post(`/api/runs`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.status).to.equal(400);
    });

    it('should throw 400 error when source is missing', async () => {
        const params = {
            lang: 'cpp',
            stdin: (new Buffer(stdin).toString('base64')),
            mode: 'sync'
        };

        const res = await chai.request(app).post(`/api/runs`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.status).to.equal(400);
        expect(res.body.err.message).to.equal('"source" is required');
    });

    it('should NOT throw error when stdin is missing', async () => {
        const params = {
            source: (new Buffer(source).toString('base64')),
            lang: 'cpp',
            mode: 'sync'
        };

        const res = await chai.request(app).post(`/api/runs`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.status).to.equal(200);
        expect(res.body.stdout).to.equal(expectedOutput);
    });

    it('should throw 400 error for incorrect mode ', async () => {
        const params = {
            source: (new Buffer(source).toString('base64')),
            lang: 'cpp',
            stdin: (new Buffer(stdin).toString('base64')),
            mode: 'incorrect mode'
        };

        const res = await chai.request(app).post(`/api/runs`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.status).to.equal(400);
        expect(res.body.err.message).to.equal('"mode" must be one of [sync, callback, poll]');
    });

    it('should return correct stdout in sync mode ', async () => {
        const params = {
            source: (new Buffer(source).toString('base64')),
            lang: 'cpp',
            stdin: (new Buffer(stdin).toString('base64')),
            mode: 'sync'
        };

        const res = await chai.request(app).post(`/api/runs`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.status).to.equal(200);
        expect(res.body.stdout).to.equal(expectedOutput);
    });

    it('should return correct submission.id in poll mode', async () => {
        const params = {
            source: (new Buffer(source).toString('base64')),
            lang: 'cpp',
            stdin: (new Buffer(stdin).toString('base64')),
            mode: 'poll'
        };

        const res = await chai.request(app).post(`/api/runs`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.body.id).to.exist;
        expect(res.status).to.equal(200);

        // there is a delay of 1000 for onSuccess, so setting 2000ms delay here.
        await utils.delay(2000);
        const resultResponse = await chai.request(app).get(`/api/result/${res.body.id}`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.body.id).to.exist;
        expect(res.status).to.equal(200);
        expect(resultResponse.body.stdout).to.equal(expectedOutput);
    });

    it('should return id and send result to callback url in callback mode', async () => {
        const params = {
            lang: 'cpp',
            source: (new Buffer(source).toString('base64')),
            stdin: (new Buffer(stdin).toString('base64')),
            mode: 'callback',
            callback: 'http://localhost:2406'
        };

        const res = await chai.request(app).post(`/api/runs`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        let resultFromCallBack;

        // Mock server for callback
        const app2 = express();
        app2.use(express.json());
        const router = Router();
        app2.listen(2406, () => {
            router.post('/', (req, res) => {
                resultFromCallBack = req.body;
            });
            app2.use('/', router);
        });

        await utils.delay(2000);

        expect(res.body.id).to.exist;
        expect(res.status).to.equal(200);
        expect(resultFromCallBack.stdout).to.equal(expectedOutput);
    });
});