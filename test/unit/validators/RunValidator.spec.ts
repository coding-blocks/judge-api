// @ts-nocheck
import RunValidator from '../../../src/routes/api/run/validators';

const sinon = require('sinon');
const chai = require('chai');
const {expect} = chai;

var res, err, sentData, sentStatus, nextSpy;
const runValidator = new RunValidator();
describe('RunValidator', async () => {
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
                stdin: 'INPUT'
            }
        };

        await runValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"lang" is required');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error when source is missing', async () => {
        const req = {
            body: {
                mode: 'sync',
                lang: 'cpp',
                stdin: 'INPUT'
            }
        };

        await runValidator.POST(req, res, nextSpy);

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
                stdin: 'INPUT'
            }
        };

        await runValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"source" must be a string');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should NOT throw an error when mode is missing', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                stdin: 'INPUT'
            }
        };

        await runValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.true;
    });

    it('should throw an error when mode is NOT string', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 123,
                stdin: 'INPUT'
            }
        };

        await runValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error when mode is not one of "callback, poll, sync"', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'wrongMode',
                stdin: 'INPUT'
            }
        };


        await runValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
        expect(sentData.err.message).to.equal('"mode" must be one of [sync, callback, poll]');
    });

    it('should throw error if mode is callback and callback is missing', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'callback',
                stdin: ''
            }
        };

        await runValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.be.equal(400);
        expect(sentData.err.message).to.equal('"callback" is required');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should not throw an error with STDIN missing', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll'
            }
        };
        await runValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.true;
    });

    it('should throw an error when STDIN in not string', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll',
                stdin: 123
            }
        };

        await runValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
        expect(sentStatus).to.be.equal(400);
        expect(sentData.err.message).to.equal('"stdin" must be a string');
    });

    it('should allow STDIN as empty string', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll',
                stdin: ''
            }
        };

        await runValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.true;
    });

    it('should throw an error when timelimit is not integer', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll',
                stdin: '',
                timelimit: 'abc'
            }
        };

        await runValidator.POST(req, res, nextSpy);

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
                stdin: 'something'
            }
        };

        await runValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.true;
    });
});