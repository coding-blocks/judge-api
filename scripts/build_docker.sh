#!/usr/bin/env bash

VERSION=$(node -p -e "require('./package.json').version")

npm install -D
npm run build

docker build -t codingblocks/judge-api:$VERSION -t codingblocks/judge-api .
docker system prune -f

read -p "Push to Docker? [Press Enter to continue]"
docker push codingblocks/judge-api:$VERSION
docker push codingblocks/judge-api