const developmentConfig = require('./development-config');
const testConfig = require('./test-config');

if (process.env.NODE_PATH === 'test') {
    module.exports = testConfig;
}
else {
    module.exports = developmentConfig;
}