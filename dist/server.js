"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const dbg = require("debug");
const config = require("../config");
exports.config = config;
const path = require("path");
const api_1 = require("./routes/api");
const debug = dbg('server:main');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/docs', express.static(path.join(__dirname, '../docs')));
app.use('/api', api_1.default);
exports.default = app;
//# sourceMappingURL=server.js.map