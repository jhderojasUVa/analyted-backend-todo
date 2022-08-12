# Origin
FROM node:lts-alpine3.16

WORKDIR /usr/src/app
COPY . .
RUN npm install

EXPOSE 8080
CMD [ "node", "./src/index.js" ]
