module.exports = {
  apps : [{
    name: 'Judge2 API',
    script: 'dist/run.js',
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      ...require('secrets.json')
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
