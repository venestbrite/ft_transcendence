FROM node:16.14.0-alpine3.15

RUN npm install -g http-server

RUN apk update

RUN apk add openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
CMD [ "npm", "run", "dev" ]
