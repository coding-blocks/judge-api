"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const debug = require("debug");
const models_1 = require("./db/models");
const log = debug('judge:api');
models_1.db.sync({})
    .then(() => {
    log('Database Synced');
    server_1.default.listen(server_1.config.PORT, () => {
        log(`Server started on http://localhost:${server_1.config.PORT}`);
    });
})
    .catch((err) => console.error(err));
//# sourceMappingURL=run.js.map