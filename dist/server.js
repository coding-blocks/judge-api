"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const dbg = require("debug");
const config = require("../config");
const path = require("path");
const debug = dbg('server');
const app = express();
app.use('/docs', express.static(path.join(__dirname, '../docs')));
app.listen(config.PORT, () => {
    debug(`Server started on http://localhost:${config.PORT}`);
});
//# sourceMappingURL=server.js.map