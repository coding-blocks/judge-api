"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const dbg = require("debug");
const config = require("../config");
const debug = dbg('server');
const app = express();
app.listen(config.DEFAULT_PORT, () => {
    debug(`Server started on http://localhost:${config.DEFAULT_PORT}`);
});
//# sourceMappingURL=server.js.map