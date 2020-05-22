// @ts-nocheck
import ProjectValidator from '../../../src/routes/api/project/validators';

const sinon = require('sinon');
const chai = require('chai');
const {expect} = chai;

var res, err, sentData, sentStatus, nextSpy;
const projectValidator = new ProjectValidator();

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
                problem: 'https://minio.cb.lk/public/input',
                submission: 'https://minio.cb.lk/public/input',
                submissionDirs: 'src',
                mode: 'poll',
                timelimit: 1
            }
        };

        await projectValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"lang" is required');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error with problem is missing', async () => {
        const req = {
            body: {
                lang: 'node',
                submission: 'https://minio.cb.lk/public/input',
                submissionDirs: 'src',
                mode: 'poll',
                timelimit: 1
            }
        };

        await projectValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"problem" is required');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error when problem is not a url', async () => {
        const req = {
            body: {
                lang: 'node',
                problem: 'not-a-url',
                submission: 'https://minio.cb.lk/public/input',
                submissionDirs: 'src',
                mode: 'poll',
                timelimit: 1
            }
        };

        await projectValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"problem" must be a valid uri');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error when problem is not a string', async () => {
        const req = {
            body: {
                lang: 'node',
                problem: 123,
                submission: 'https://minio.cb.lk/public/input',
                submissionDirs: 'src',
                mode: 'poll',
                timelimit: 1
            }
        };

        await projectValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"problem" must be a string');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error with submission is missing', async () => {
        const req = {
            body: {
                lang: 'node',
                problem: 'https://minio.cb.lk/public/input',
                submissionDirs: 'src',
                mode: 'poll',
                timelimit: 1
            }
        };

        await projectValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"submission" is required');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error when submission is not a url', async () => {
        const req = {
            body: {
                lang: 'node',
                problem: 'https://minio.cb.lk/public/input',
                submission: 'not-a-url',
                submissionDirs: 'src',
                mode: 'poll',
                timelimit: 1
            }
        };

        await projectValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"submission" must be a valid uri');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error when submission is not a string', async () => {
        const req = {
            body: {
                lang: 'node',
                problem: 'https://minio.cb.lk/public/input',
                submission: 123,
                submissionDirs: 'src',
                mode: 'poll',
                timelimit: 1
            }
        };

        await projectValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.equal(400);
        expect(sentData.err.message).to.equal('"submission" must be a string');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should NOT throw an error when mode is missing', async () => {
        const req = {
            body: {
                lang: 'node',
                problem: 'https://minio.cb.lk/public/input',
                submission: 'https://minio.cb.lk/public/input',
                submissionDirs: 'src',
                timelimit: 1
            }
        };

        await projectValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.true;
    });

    it('should throw an error when mode is NOT string', async () => {
        const req = {
            body: {
                lang: 'node',
                problem: 'https://minio.cb.lk/public/input',
                submission: 'https://minio.cb.lk/public/input',
                submissionDirs: 'src',
                mode: 123,
                timelimit: 1
            }
        };

        await projectValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error when mode is not one of "callback, poll, sync"', async () => {
        const req = {
            body: {
                lang: 'node',
                problem: 'https://minio.cb.lk/public/input',
                submission: 'https://minio.cb.lk/public/input',
                submissionDirs: 'src',
                mode: 'wrongMode',
                timelimit: 1
            }
        };


        await projectValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.false;
        expect(sentData.err.message).to.equal('"mode" must be one of [sync, callback, poll]');
    });

    it('should throw error if mode is callback and callback is missing', async () => {
        const req = {
            body: {
                lang: 'node',
                problem: 'https://minio.cb.lk/public/input',
                submission: 'https://minio.cb.lk/public/input',
                submissionDirs: 'src',
                mode: 'callback',
                timelimit: 1
            }
        };

        await projectValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.be.equal(400);
        expect(sentData.err.message).to.equal('"callback" is required');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should throw an error when timelimit is not integer', async () => {
        const req = {
            body: {
                lang: 'node',
                problem: 'https://minio.cb.lk/public/input',
                submission: 'https://minio.cb.lk/public/input',
                submissionDirs: 'src',
                mode: 'poll',
                timelimit: 'abc'
            }
        };

        await projectValidator.POST(req, res, nextSpy);

        expect(sentStatus).to.be.equal(400);
        expect(sentData.err.message).to.equal('"timelimit" must be a number');
        expect(nextSpy.calledOnce).to.be.false;
    });

    it('should NOT throw error for correct values', async () => {
        const req = {
            body: {
                lang: 'node',
                problem: 'https://minio.cb.lk/public/input',
                submission: 'https://minio.cb.lk/public/input',
                submissionDirs: 'src',
                mode: 'poll',
                timelimit: 1
            }
        };

        await projectValidator.POST(req, res, nextSpy);

        expect(nextSpy.calledOnce).to.be.true;
    });
});