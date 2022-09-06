# Origin
FROM node:lts-alpine3.16

WORKDIR /usr/src/app
COPY . .
RUN npm install

LABEL org.opencontainers.image.source https://github.com/jhderojasUVa/analyted-backend-todo

EXPOSE 8080
CMD [ "node", "./src/index.js" ]
