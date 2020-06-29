import app from '../../src/server';
import DB from '../../src/models';
import express = require('express');
import { Router } from 'express';
import * as utils from '../utils/utils';
import ProjectController from '../../src/routes/api/project/controller';

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const {expect} = chai;

const APIKEY = '7718330d2794406c980bdbded6c9dc1d';


function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

describe('POST api/project', () => {
    before(async () => {
        await DB.apikeys.create({
            id: 1,
            key: APIKEY,
            whitelist_domains: ['*'],
            whitelist_ips: ['*']
        });
        await DB.langs.create({
            lang_slug: 'node',
            lang_name: 'NodeJS',
            lang_version: '10'
        });
        await utils.setupMockQueue();

    });
    after(utils.truncateTables);

    it('should throw 403 error if API Key is absent', async () => {
        const res = await chai.request(app).post(`/api/project`);

        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('No API Key in request');
    });

    it('should throw 404 error if GET request is made', async () => {
        const res = await chai.request(app).get(`/api/project`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        });

        expect(res.status).to.equal(404);
    });

    it('should throw 400 error if correct params are not sent along with the POST request', async () => {
        const res = await chai.request(app).post(`/api/project`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send({});

        expect(res.status).to.equal(400);
        expect(res.body.err.message).to.equal('"lang" is required');
    });

    it('should throw 400 error for problem missing', async () => {
        const params = {
            lang: 'node',
            submission: 'https://minio.cb.lk/public/input',
            config: `
project:
  allowed-folders:
    - src/**/*.js
  before-test:
    - yarn install
    - yarn build
  testcases:
    - yarn test
            `,
            mode: 'sync',
            timelimit: 1
        };

        const res = await chai.request(app).post(`/api/project`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.status).to.equal(400);
        expect(res.body.err.message).to.equal('"problem" is required');
    });

    it('should throw 400 error when problem is not an url', async () => {
        const params = {
            lang: 'node',
            problem: 'not-a-url',
            submission: 'https://minio.cb.lk/public/input',
            config: `
project:
  allowed-folders:
    - src/**/*.js
  before-test:
    - yarn install
    - yarn build
  testcases:
    - yarn test
            `,
            mode: 'sync',
            timelimit: 1
        };

        const res = await chai.request(app).post(`/api/project`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.status).to.equal(400);
        expect(res.body.err.message).to.equal('"problem" must be a valid uri');
    });

    it('should throw 400 error for submission missing', async () => {
        const params = {
            lang: 'node',
            problem: 'https://minio.cb.lk/public/input',
            config: `
project:
  allowed-folders:
    - src/**/*.js
  before-test:
    - yarn install
    - yarn build
  testcases:
    - yarn test
            `,
            mode: 'sync',
            timelimit: 1
        };

        const res = await chai.request(app).post(`/api/project`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.status).to.equal(400);
        expect(res.body.err.message).to.equal('"submission" is required');
    });

    it('should throw 400 error when submission is not an url', async () => {
        const params = {
            lang: 'node',
            problem: 'https://minio.cb.lk/public/input',
            submission: 'not-a-url',
            config: `
project:
  allowed-folders:
    - src/**/*.js
  before-test:
    - yarn install
    - yarn build
  testcases:
    - yarn test
            `,
            mode: 'sync',
            timelimit: 1
        };

        const res = await chai.request(app).post(`/api/project`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.status).to.equal(400);
        expect(res.body.err.message).to.equal('"submission" must be a valid uri');
    });

    it('should throw 400 error for config missing', async () => {
        const params = {
            lang: 'node',
            problem: 'https://minio.cb.lk/public/input',
            submission: 'https://minio.cb.lk/public/input',
            mode: 'sync',
            timelimit: 1
        };

        const res = await chai.request(app).post(`/api/project`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.status).to.equal(400);
        expect(res.body.err.message).to.equal('"config" is required');
    });

    it('should throw 400 error when config is not a string', async () => {
        const params = {
            lang: 'node',
            problem: 'https://minio.cb.lk/public/input',
            submission: 'https://minio.cb.lk/public/input',
            config: 123,
            mode: 'sync',
            timelimit: 1
        };

        const res = await chai.request(app).post(`/api/project`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.status).to.equal(400);
        expect(res.body.err.message).to.equal('"config" must be an array');
    });

    it('should throw 400 error for incorrect mode ', async () => {
        const params = {
            lang: 'node',
            problem: 'https://minio.cb.lk/public/input',
            submission: 'https://minio.cb.lk/public/input',
            config: `
project:
  allowed-folders:
    - src/**/*.js
  before-test:
    - yarn install
    - yarn build
  testcases:
    - yarn test
            `,
            mode: 'abc',
            timelimit: 1
        };

        const res = await chai.request(app).post(`/api/project`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.status).to.equal(400);
        expect(res.body.err.message).to.equal('"mode" must be one of [sync, callback, poll]');
    });

    it('should throw 400 if mode is callback but callback is not present', async () => {
        const params = {
            lang: 'node',
            problem: 'https://minio.cb.lk/public/input',
            submission: 'https://minio.cb.lk/public/input',
            config: `
project:
  allowed-folders:
    - src/**/*.js
  before-test:
    - yarn install
    - yarn build
  testcases:
    - yarn test
            `,
            mode: 'callback',
            timelimit: 1
        };

        const res = await chai.request(app).post(`/api/project`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.status).to.equal(400);
        expect(res.body.err.message).to.equal('"callback" is required');
    });

    it('should return correct result in sync mode ', async () => {
        const params = {
            lang: 'node',
            problem: 'https://minio.cb.lk/public/input',
            submission: 'https://minio.cb.lk/public/input',
            config: `
project:
  allowed-folders:
    - src/**/*.js
  before-test:
    - yarn install
    - yarn build
  testcases:
    - yarn test
            `,
            mode: 'sync',
            timelimit: 1
        };

        const res = await chai.request(app).post(`/api/project`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        expect(res.body.score).to.equal(100);
        expect(res.status).to.equal(200);
    });


    it('should return correct submission.id in poll mode', async () => {
        const params = {
            lang: 'node',
            problem: 'https://minio.cb.lk/public/input',
            submission: 'https://minio.cb.lk/public/input',
            config: `
project:
  allowed-folders:
    - src/**/*.js
  before-test:
    - yarn install
    - yarn build
  testcases:
    - yarn test
            `,
            mode: 'poll',
            timelimit: 1
        };

        const res = await chai.request(app).post(`/api/project`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);


        // there is a delay of 1000 for onSuccess, so setting 2000ms delay here.
        await delay(2000);
        const submission = await DB.submissions.findById(res.body.id);

        expect(res.body.id).to.exist;
        expect(res.status).to.equal(200);
        expect(submission.results.score).to.equal(100);
    });

    it('should return id and send result to callback url in callback mode', async () => {
        const params = {
            lang: 'node',
            problem: 'https://minio.cb.lk/public/input',
            submission: 'https://minio.cb.lk/public/input',
            config: `
project:
  allowed-folders:
    - src/**/*.js
  before-test:
    - yarn install
    - yarn build
  testcases:
    - yarn test
            `,
            mode: 'callback',
            callback: 'http://localhost:2404',
            timelimit: 1
        };

        const res = await chai.request(app).post(`/api/project`).set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        }).send(params);

        let resultFromCallBack;

        // Mock server for callback
        const app2 = express();
        app2.use(express.json());
        const router = Router();
        app2.listen(2404, () => {
            router.post('/', (req, res) => {
                resultFromCallBack = req.body;
            });
            app2.use('/', router);
        });

        await delay(2000);

        expect(res.body.id).to.exist;
        expect(res.status).to.equal(200);
        expect(resultFromCallBack.score).to.equal(100);
    });
});