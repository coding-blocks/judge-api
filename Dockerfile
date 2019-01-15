FROM node:8-alpine

WORKDIR /usr/src/judge-api

COPY package.json .
RUN npm install -D

COPY . .

RUN npm run build

EXPOSE 3737

CMD ["npm", "start"]
