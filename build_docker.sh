#!/usr/bin/env bash

npm install -D
npm run build

docker build -t codingblocks/judge-api .
docker system prune

read -p "Push to Docker? [Press Enter to continue]"
docker push codingblocks/judge-api