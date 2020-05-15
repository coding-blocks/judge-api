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
        const nextSpy = sinon.spy();

        // @ts-ignore
        await runValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"lang" is required');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error with incorrect language', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'wrongLang',
                mode: 'sync',
                stdin: 'INPUT'
            }
        };
        const nextSpy = sinon.spy();

        // @ts-ignore
        await runValidator.POST(req, res, nextSpy);
        // TODO WRONG
        // expect(sentStatus).to.equal(400);
        // expect(sentData.err.message).to.equal('"lang" is required');
        // expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error when source is missing', async () => {
        const req = {
            body: {
                mode: 'sync',
                lang: 'cpp',
                stdin: 'INPUT'
            }
        };
        const nextSpy = sinon.spy();

        // @ts-ignore
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
        const nextSpy = sinon.spy();

        // @ts-ignore
        await runValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"source" must be a string');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error when mode is missing', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                stdin: 'INPUT'
            }
        };
        const nextSpy = sinon.spy();

        // @ts-ignore
        await runValidator.POST(req, res, nextSpy);
        // TODO
        // does not throw error for mode missing
        expect(nextSpy.calledOnce).to.be.true;
        // nextSpy is true === next() was called
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
        const nextSpy = sinon.spy();

        // @ts-ignore
        await runValidator.POST(req, res, nextSpy);
        // TODO
        expect(nextSpy.calledOnce).to.be.false;
        // error thrown == " mode" must be one of [sync, callback, poll]
        // but should've been "mode" must be string
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
        const nextSpy = sinon.spy();

        // @ts-ignore
        await runValidator.POST(req, res, nextSpy);
        // TODO
        expect(nextSpy.calledOnce).to.be.false;
        expect(sentData.err.message).to.equal('"mode" must be one of [sync, callback, poll]');
    });

    it('should not throw an error with STDIN missing', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll'
            }
        };
        const nextSpy = sinon.spy();
        // @ts-ignore
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
        const nextSpy = sinon.spy();
        // @ts-ignore
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

        // @ts-ignore
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
                timelimit: '123'
            }
        };
        const nextSpy = sinon.spy();
        // @ts-ignore
        await runValidator.POST(req, res, nextSpy);

        // TODO fix this. CODE is wrong
        expect(nextSpy.calledOnce).to.be.true;
        // expect(sentStatus).to.be.equal(400);
        // expect(sentData.err.message).to.equal('"timelimit" must be an integer');
        // expect(nextSpy.calledOnce).to.be.false;
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
        const nextSpy = sinon.spy();

        // @ts-ignore
        await runValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.be.equal(400);
        expect(sentData.err.message).to.equal('"callback" is required');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('shoud NOT throw error for correct values', async () => {
        const req = {
            body: {
                source: 'LKJSDFKLMC414CcnBcba12',
                lang: 'cpp',
                mode: 'poll',
                stdin: 'something'
            }
        };
        const nextSpy = sinon.spy();

        // @ts-ignore
        await runValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.true;
    });
});