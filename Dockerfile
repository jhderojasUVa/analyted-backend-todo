# Origin
FROM node:lts-alpine3.16

# Set use no docker version (for localhost)
ENV NO_DOCKER=false

# Set the working directory on the app
WORKDIR /usr/src/app
# Copy all the current code
COPY . .
# Install dependencies
RUN npm install

# Tag it
LABEL org.opencontainers.image.source https://github.com/jhderojasUVa/analyted-backend-todo

# Expose the express port
EXPOSE 8080
# Execute
CMD [ "node", "./src/index.js" ]
