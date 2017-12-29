"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isInvalidRunRequest(req) {
    // TODO: Validate parameters of submission request (like source should be url)
    if (!req.body.lang || (typeof req.body.lang !== 'string')) {
        return new Error('Invalid Language');
    }
    if (!req.body.source) {
        return new Error('Source not found');
    }
    if (!req.body.stdin) {
        req.body.stdin = '';
    }
    return false;
}
exports.isInvalidRunRequest = isInvalidRunRequest;
//# sourceMappingURL=SubmissionValidators.js.map