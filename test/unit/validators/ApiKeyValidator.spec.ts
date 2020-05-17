// @ts-nocheck
import * as utils from '../../utils/utils';
import {checkValidApiKey} from '../../../src/validators/ApiKeyValidators';
import {Request} from 'express'
import DB from "../../../src/models";

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const {expect} = chai;
chai.use(chaiAsPromised);

const APIKEY = '7718330d2794406c980bdbded6c9dc1d';

describe('API Key Validtors', async () => {
    beforeEach(async () => {
        await DB.apikeys.create({
            key: APIKEY, whitelist_domains: ['*'],
            whitelist_ips: ['*']
        });
    });
    afterEach(utils.truncateTables);

    it('should reject an invalid api', () => {
        const req: Request = {
            header(name): any {
                if (name === 'Authorization') {
                    return 'Bearer someWrongAPI'
                }
            }
        };

        expect(checkValidApiKey(req)).to.be.rejectedWith('Invalid API Key');
    });

    it('should reject no api', () => {
        const req: Request = {
            header(name): any {
            }
        };

        expect(checkValidApiKey(req)).to.be.rejectedWith('No API Key in request');
    });

    it('should reject api without whitelist dommain/ip', async () => {
        const currentKey = 'SDLKJFLSJDKCWEKRJC';
        await DB.apikeys.bulkCreate([
            {key: currentKey}
        ]);

        const req: Request = {
            header(name): any {
                if (name === 'Authorization') {
                    return `Bearer ${currentKey}`
                }
            }
        };

        expect(checkValidApiKey(req)).to.be.rejectedWith('IP or Domain not in whitelist');
    });

    it('should NOT reject api with a whitelist ip', async () => {
        const currentKey = 'SDLKJFLSJDKCWEKRJC';
        const remoteAddress = '10.9.2.41';

        await DB.apikeys.bulkCreate([
            {key: currentKey, whitelist_ips: [remoteAddress]}
        ]);

        const req: Request = {
            header(name): any {
                if (name === 'Authorization') {
                    return `Bearer ${currentKey}`
                }
            }
        };
        req.connection = {
            remoteAddress
        };

        expect(checkValidApiKey(req)).to.not.be.rejected;
    });

    it('should NOT reject api with a whitelist domain', async () => {
        const currentKey = 'SDLKJFLSJDKCWEKRJC';
        const domainExample = 'www.google.com';

        await DB.apikeys.create({
            key: currentKey,
            whitelist_domains: [domainExample]
        });

        const req: Request = {
            header(name): any {
                if (name === 'Authorization') {
                    return `Bearer ${currentKey}`;
                }
                if (name === 'Referer') {
                    return domainExample;
                }
            }
        };

        expect(checkValidApiKey(req)).to.not.be.rejected;
    });

    it('should NOT reject api with whitelist ip/domain as "*"', async () => {
        const req: Request = {
            header(name): any {
                if (name === 'Authorization') {
                    return `Bearer ${APIKEY}`
                }
            }
        };

        expect(checkValidApiKey(req)).to.not.be.rejected;
    })
});