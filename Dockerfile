FROM node:8-alpine

WORKDIR /usr/src/judge-api

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

ENV PORT=3737
EXPOSE 3737

CMD ["npm", "start"]
