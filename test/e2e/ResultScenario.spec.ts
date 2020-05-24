import app from '../../src/server';
import DB from '../../src/models';
import * as utils from "../utils/utils";

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const {expect} = chai;

const APIKEY = '7718330d2794406c980bdbded6c9dc1d';

describe('GET api/result/:id', () => {
    before(async () => {
        await DB.apikeys.create({
            id: 1,
            key: APIKEY,
            whitelist_domains: ['*'],
            whitelist_ips: ['*']
        });
    });
    after(utils.truncateTables);


    it('should throw 403 error API key is absent in the request', async () => {
        const res = await chai.request(app).get(`/api/result/1`);
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('No API Key in request');
    });

    it('should throw error if incorrect API key is present', async () => {
        const res = await chai.request(app).get('/api/result/1').set({
            'Authorization': 'Bearer incorrectAPI-KEY',
            Accept: 'application/json'
        });
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('Invalid API Key');
    });

    it('should throw 404 error if POST request is made', async () => {
        const res = await chai.request(app).post('/api/result/1').set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        });
        expect(res.status).to.equal(404);
    });

    it('should throw 404 error resultId is not present', async () => {
        const res = await chai.request(app).get('/api/result').set({
            Authorization: `Bearer ${APIKEY}`,
            Accept: 'application/json'
        });

        expect(res.status).to.equal(404);
    });

    it('should throw 404 error if result is not found ', async () => {
        const res = await chai.request(app).get('/api/result/12').set({
            Authorization: `Bearer ${APIKEY}`,
            Accept: 'application/json'
        });

        expect(res.status).to.equal(404);
    });

    it('should return correct result if everything is correct', async () => {
        const submission = await DB.submissions.create({
            lang: 'cpp',
            mode: 'poll',
            results: {stdout: 'SUCCESS'}
        });
        const res = await chai.request(app).get(`/api/result/${submission.id}`).set({
            Authorization: `Bearer ${APIKEY}`,
            Accept: 'application/json'
        });

        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal(submission.results);
    });
});