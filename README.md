# JUDGE API SERVER

[![Greenkeeper badge](https://badges.greenkeeper.io/coding-blocks/judge-api.svg)](https://greenkeeper.io/)

[![CircleCI](https://circleci.com/gh/coding-blocks/judge-api.svg?style=svg)](https://circleci.com/gh/coding-blocks/judge-api)
[![Build Status](https://travis-ci.org/coding-blocks/judge-api.svg?branch=master)](https://travis-ci.org/coding-blocks/judge-api)
[![codecov](https://codecov.io/gh/coding-blocks/judge-api/branch/master/graph/badge.svg)](https://codecov.io/gh/coding-blocks/judge-api)

[![apidocs](https://img.shields.io/badge/api-docs-blue.svg?style=popout-square)](http://docs.judge.codingblocks.in/)



## Testing

To run mocha-based tests
```shell
npm run test
```

To get coverage report
```shell
npm run cover
```


### NOTES
If using a fresh db, seed the languages before testing

```shell
npm run build
npm run seedlangs
```


## Requirements

### Database (Postgres)
We need a PostgreSQL database to run. Please configure the following env variables -

```env
    DB_NAME='judgeapi',
    DB_USER='judgeapi',
    DB_PASS='judgeapi',
    DB_HOST='localhost'
```
### Queue (RabbitMQ)