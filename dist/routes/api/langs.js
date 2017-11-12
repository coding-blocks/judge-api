"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../../db/models");
const route = express_1.Router();
exports.route = route;
/**
 * @api {get} /langs GET /langs
 * @apiDescription Get all supported Languages
 * @apiName GetLangs
 * @apiGroup Langs
 * @apiVersion 0.0.1
 *
 *
 */
route.get('/', (req, res, next) => {
    models_1.Langs.findAll()
        .then((langs) => {
        res.status(200).json(langs);
    });
});
//# sourceMappingURL=langs.js.map