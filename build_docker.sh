#!/usr/bin/env bash

docker build -t codingblocks/judge-api .
docker system prune

read -p "Push to Docker? [Press Enter to continue]"
docker push codingblocks/judge-api