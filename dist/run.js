"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const debug = require("debug");
server_1.default.listen(server_1.config.PORT, () => {
    debug('server:run')(`Server started on http://localhost:${server_1.config.PORT}`);
});
//# sourceMappingURL=run.js.map