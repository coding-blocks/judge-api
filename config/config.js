const developmentConfig = require('./development-config');
const testConfig = require('./test-config');

if (process.env.NODE_ENV === 'test') {
    module.exports = testConfig;
}
else {
    module.exports = developmentConfig;
}