module.exports = {
  apps : [{
    name: 'judge2-api',
    script: 'dist/run.js',
    autorestart: true,
    interpreter: '/home/codingblocks/.nvm/versions/node/v10.21.0/bin/node',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      NODE_PATH: 'dist',
      ...require('./secrets.json')
    },
    env_production: {
      ...require('./secrets.json'),
      NODE_PATH: 'dist',
      NODE_ENV: 'production'
    }
  }]
};
