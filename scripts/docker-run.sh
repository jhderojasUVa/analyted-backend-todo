#!/bin/bash
## Get version
VERSION=$1

# If you don't say the version it will always run the latest
if [ -z "$1" ]
then
    docker run --name analyted-backend --network analyted_network -p 8080:8080 -d ghcr.io/jhderojasuva/analyted-backend-todo/analyted-backend:$1
else
    docker run --name analyted-backend --network analyted_network -p 8080:8080 -d ghcr.io/jhderojasuva/analyted-backend-todo/analyted-backend:latest
fi
