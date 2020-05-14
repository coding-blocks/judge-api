FROM node:10-alpine

WORKDIR /usr/src/judge-api
RUN apk add --no-cache yarn

COPY package.json .
RUN yarn

COPY . .

RUN yarn build

EXPOSE 3737

CMD ["npm", "start"]
