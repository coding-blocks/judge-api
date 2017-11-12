"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
const config = require("../../config");
const dbg = require("debug");
const debug = dbg('judge:db');
const DataTypes = Sequelize.DataTypes;
const db = new Sequelize(config.DB.DATABASE, config.DB.USERNAME, config.DB.PASSWORD, {
    logging: debug
});
const Langs = db.define('langs', {
    lang_slug: {
        type: DataTypes.String(10),
        primaryKey: true
    },
    lang_name: DataTypes.STRING,
    lang_version: DataTypes.STRING
});
exports.Langs = Langs;
const Submissions = db.define('submissions', {
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    results: DataTypes.ARRAY(DataTypes.NUMBER)
});
exports.Submissions = Submissions;
const ApiKeys = db.define('apikeys', {
    key: DataTypes
});
exports.ApiKeys = ApiKeys;
Submissions.belongsTo(ApiKeys);
Submissions.belongsTo(Langs);
//# sourceMappingURL=models.js.map