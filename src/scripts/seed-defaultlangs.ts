import DB from '../models'

DB.sequelize.sync()
  .then(() => DB.langs.sync({ force: true }))
  .then(async () => { console.log('Languages Synced') })
  .then(() =>
    DB.langs.bulkCreate([
      { lang_slug: 'py2', lang_name: 'Python 2', lang_version: '2.7' },
      { lang_slug: 'py3', lang_name: 'Python 3', lang_version: '3.6' },
      { lang_slug: 'java8', lang_name: 'Java', lang_version: '1.8' },
      { lang_slug: 'nodejs8', lang_name: 'NodeJS 8', lang_version: '8' },
      { lang_slug: 'nodejs10', lang_name: 'NodeJS 10', lang_version: '10' },
      { lang_slug: 'cpp', lang_name: 'C++', lang_version: '11' },
      { lang_slug: 'c', lang_name: 'C', lang_version: '6' },
      { lang_slug: 'mysql', lang_name: 'MySQL', lang_version: '10.4' }
    ]))
  .then(async () => { console.log('Languages Seeded') })
  .then(() => DB.apikeys.sync({ force: true }))
  .then(async () => { console.log('API Keys Synced') })
  .then(() =>
    DB.apikeys.bulkCreate([
      { id: 1, key: '7718330d2794406c980bdbded6c9dc1d', whitelist_domains: ['*'], whitelist_ips: ['*'] }
    ]))
  .then(async () => { console.log('API Keys Seeded') })
  .catch(console.error)
  .finally(() => {
    try {
      DB.sequelize.close()
    } catch (e) {

    }
  })

