const developmentConfig = require('./development');
const testConfig = require('./test');
const productionConfig = require('./production');

const env = process.env.NODE_ENV || 'development';

if (env === 'test') {
    module.exports = testConfig;
}
else if(env === 'production') {
    module.exports = productionConfig;
}
else {
    module.exports = developmentConfig;
}