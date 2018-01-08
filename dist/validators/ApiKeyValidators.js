"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../db/models");
function checkValidApiKey(req) {
    return new Promise((resolve, reject) => {
        let apiKey = req.header('Authorization').split('Bearer ')[1];
        if (!apiKey) {
            reject(new Error('No API Key in request'));
        }
        models_1.ApiKeys.findOne({
            where: {
                key: apiKey
            }
        }).then((apiKey) => {
            if (apiKey.whitelist_domains && apiKey.whitelist_domains.length > 0) {
                if (apiKey.whitelist_domains[0] === '*') {
                    return resolve();
                }
                if (apiKey.whitelist_domains.indexOf('Referer')) {
                    return resolve();
                }
            }
            if (apiKey.whitelist_ips && apiKey.whitelist_ips.length > 0) {
                if (apiKey.whitelist_ips[0] === '*') {
                    return resolve();
                }
                const clientIp = req.header('x-forwarded-for') || req.connection.remoteAddress;
                if (apiKey.whitelist_ips.indexOf(clientIp) !== -1) {
                    return resolve();
                }
            }
            return reject(new Error('IP or Domain not in whitelist'));
        }).catch((err) => {
            reject(new Error('Invalid API Key'));
        });
    });
}
exports.checkValidApiKey = checkValidApiKey;
//# sourceMappingURL=ApiKeyValidators.js.map