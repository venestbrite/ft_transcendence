FROM node:16.14.0-alpine3.15

RUN npm install -g http-server

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5050
CMD [ "npm", "run", "start:dev" ]
