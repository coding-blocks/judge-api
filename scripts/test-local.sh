#!/usr/bin/env bash

curl -L https://raw.githubusercontent.com/coding-blocks/judge-compose/master/docker-compose-withdb.yml > docker-compose.yml
curl -L https://raw.githubusercontent.com/coding-blocks/judge-compose/master/judgeapi-example.env > .env

docker build -t codingblocks/judge-api .
docker-compose -p judgecompose up -d

docker exec judgecompose_api_1 scripts/wait-for-it.sh -t 180 api:3737 -- npm run seedlangs
docker kill judgecompose_api_1
docker run -t --env-file .env \
        --network judgecompose_default \
        --env "DEBUG=test:* JUDGEAPI_HOST=api JUDGEAPI_PORT=2222" codingblocks/judge-api \
        npm run test

docker-compose kill
docker-compose down

rm docker-compose.yml
rm .env

docker system prune -f
docker volume prune -f
