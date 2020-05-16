import DB from '../../src/models'
import * as debug from 'debug'

const log = debug('test:judge:api')

before(async () => {
    await DB.sequelize.sync();
    log('DB synced');
});

after(async () => {
    await DB.sequelize.close();
});