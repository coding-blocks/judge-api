#!/usr/bin/env bash
docker run \
    --env='DEBUG=*'  \
    --env DB_HOST=192.168.0.74  \
    --env RABBITMQ_HOST=arnav:arnav@192.168.0.74 \
    -p  3737:3737 \
    codingblocks/judge-api