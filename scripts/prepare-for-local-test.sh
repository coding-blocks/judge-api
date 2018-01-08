#!/usr/bin/env bash

docker-compose build
docker-compose -p judgecompose up -d

docker exec judgecompose_api_1 scripts/wait-for-it.sh -t 180 api:3737 -- npm run seedlangs
docker kill judgecompose_api_1
docker run -t --env-file test.env \
        --network judgecompose_default \
        --env "DEBUG=test:* JUDGEAPI_HOST=api JUDGEAPI_PORT=2222" codingblocks/judge-api \
        ls

read -p "Press enter after tests are over, to spin down"

docker-compose kill
docker-compose down

docker system prune -f
docker volume prune -f
