"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const run_1 = require("./run");
const submissions_1 = require("./submissions");
const langs_1 = require("./langs");
/**
 * @apiDefine AvailableLangs
 * @apiParamExample {String} lang (choices)
 * py2,java7,java8,cpp,cpp14,nodejs6,nodejs8,csharp
 */
const route = express_1.Router();
route.use('/runs', run_1.route);
route.use('/submissions', submissions_1.route);
route.use('/langs', langs_1.route);
exports.default = route;
//# sourceMappingURL=index.js.map