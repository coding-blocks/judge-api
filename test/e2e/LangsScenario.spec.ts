import app from '../../src/server';
import DB from '../../src/models';
import * as utils from "../utils/utils";

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const {expect} = chai;

const APIKEY = '7718330d2794406c980bdbded6c9dc1d';

describe('GET api/langs', () => {
    before(async () => {
        await DB.langs.bulkCreate([
            {lang_slug: 'py2', lang_name: 'Python 2', lang_version: '2.7'},
            {lang_slug: 'py3', lang_name: 'Python 3', lang_version: '3.6'},
            {lang_slug: 'java8', lang_name: 'Java', lang_version: '1.8'}
        ]);
        await DB.apikeys.bulkCreate([
            {id: 1, key: APIKEY, whitelist_domains: ['*'], whitelist_ips: ['*']}
        ]);
    });
    after(utils.truncateTables);


    it('should throw 403 error API key is absent in the request', async () => {
        const res = await chai.request(app).get(`/api/langs`);
        expect(res.status).to.equal(403);
        // TODO this should be res.body.err maybe? (consistent with other error)
        expect(res.body.message).to.equal('No API Key in request');
    });

    it('should throw error if incorrect API key is present', async () => {
        const res = await chai.request(app).get('/api/langs').set({
            'Authorization': 'Bearer incorrectAPI-KEY',
            Accept: 'application/json'
        });
        expect(res.status).to.equal(403);
        expect(res.body.message).to.equal('Invalid API Key');
        // maybe 400 error?
    });

    it('should throw 404 error if POST request is made', async () => {
        const res = await chai.request(app).post('/api/langs').set({
            Authorization: 'Bearer 7718330d2794406c980bdbded6c9dc1d',
            Accept: 'application/json'
        });
        expect(res.status).to.equal(404);
    });

    it('should return all the languages when correct request is made', async () => {
        const res = await chai.request(app).get('/api/langs').set({
            Authorization: `Bearer ${APIKEY}`,
            Accept: 'application/json'
        });

        expect(res.status).to.equal(200);
        const languages = res.body;
        expect(languages.length).to.equal(3);
        languages.forEach((language) => {
            expect(language).to.have.keys(
                'lang_slug',
                'lang_name',
                'lang_version'
            );
        })
    });
});