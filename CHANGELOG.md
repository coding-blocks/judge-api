# CHANGELOG

## 1.0.0

### 0.1.0

#### 0.0.9
 - test inside docker ecosystem
 - mock out the rabbitmq for testing

#### 0.0.6
 - validate run request body
 - close db after seedlangs

#### 0.0.5
 - default langs seeding script
 - paranoid delete submissions
 - no timestamps for languages

#### 0.0.3
 - wait-for-it AMQP_HOST:AMQP_PORT
 - keep min connection pool size to 0
 - let env var set run timeout

#### 0.0.2
 - Remove secrets.json, use only env vars

#### 0.0.1
 - POST /api/run endpoint works 