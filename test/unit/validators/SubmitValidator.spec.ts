// @ts-nocheck
import SubmitValidator from '../../../src/routes/api/submit/validators';

const sinon = require('sinon');
const chai = require('chai');
const {expect} = chai;

var res, err, sentData, sentStatus, nextSpy;
const submitValidator = new SubmitValidator();
const testcases = [
    {
        id: 1,
        input: 'https://minio.cb.lk/public/input',
        output: 'https://minio.cb.lk/public/input'
    },
    {
        id: 2,
        input: 'https://minio.cb.lk/public/input',
        output: 'https://minio.cb.lk/public/input'
    }
];
describe('SubmitValidator', async () => {
    beforeEach(() => {
        // set the data to default;
        sentData = {};
        sentStatus = null;
        res = {
            status: function (status) {
                sentStatus = status;
                return this;
            },
            json: function (msg) {
                err = msg.err;
                sentData = msg
            }
        };
        nextSpy = sinon.spy();
    });

    it('should throw an error with language missing', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                mode: 'sync',
                testcases
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"lang" is required');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error when source is missing', async () => {
        const req = {
            body: {
                mode: 'sync',
                lang: 'cpp',
                testcases
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"source" is required');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error when source is NOT string', async () => {
        const req = {
            body: {
                source: 1212,
                mode: 'sync',
                lang: 'cpp',
                testcases
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"source" must be a string');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should NOT throw an error when mode is missing', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                testcases
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.true;
    });

    it('should throw an error when mode is NOT string', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 123,
                testcases
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error when mode is not one of "callback, poll, sync"', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'wrongMode',
                testcases
            }
        };


        await submitValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
        expect(sentData.err.message).to.equal('"mode" must be one of [sync, callback, poll]');
    });

    it('should throw error if mode is callback and callback is missing', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'callback',
                testcases
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.be.equal(400);
        expect(sentData.err.message).to.equal('"callback" is required');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error with testcases missing', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll'
            }
        };
        await submitValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
        expect(sentStatus).to.be.equal(400);
        expect(sentData.err.message).to.be.equal('"testcases" is required');
    });

    it('should throw an error when testcases is not an array', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll',
                testcases : {}
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
        expect(sentStatus).to.be.equal(400);
        expect(sentData.err.message).to.be.equal('"testcases" must be an array');
    });

    it('should throw an error when testcases.length === 0', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll',
                testcases : []
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
        expect(sentStatus).to.be.equal(400);
        expect(sentData.err.message).to.be.equal('"testcases" must contain at least 1 items');
    });

    it('should throw an error when input is not a valid url', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll',
                testcases : [
                    {
                        id: 1,
                        input: 'not-a-url',
                        output: 'not-a-url'
                    }
                ]
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
        expect(sentData.err.message).to.be.equal('"testcases[0].input" must be a valid uri');
    });

    it('should throw an error when input in testcases is missing', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll',
                testcases : [
                    {
                        id: 1,
                        output: 'http:localhost:2405'
                    }
                ]
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
        expect(sentData.err.message).to.be.equal('"testcases[0].input" is required');
    });

    it('should throw an error when output in testcases is missing', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll',
                testcases : [
                    {
                        id: 1,
                        input: 'http:localhost:2405'
                    }
                ]
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
        expect(sentData.err.message).to.be.equal('"testcases[0].output" is required');
    });

    it('should throw an error when id in testcases is missing', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll',
                testcases : [
                    {
                        input: 'http:localhost:2405'
                    }
                ]
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
        expect(sentData.err.message).to.be.equal('"testcases[0].id" is required');
    });

    it('should throw an error when id in testcases is not a number', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll',
                testcases : [
                    {
                        id: 'string',
                        input: 'http:localhost:2405',
                        output: 'http:localhost:2405'
                    }
                ]
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
        expect(sentData.err.message).to.be.equal('"testcases[0].id" must be a number');
    });

    it('should throw an error when timelimit is not integer', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll',
                timelimit: 'abc',
                testcases
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.be.equal(400);
        expect(sentData.err.message).to.equal('"timelimit" must be a number');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should NOT throw error for correct values', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll',
                testcases
            }
        };

        await submitValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.true;
    });
});