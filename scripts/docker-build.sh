#!/bin/bash
## Get version
VERSION=$1

# If you don't say the version it will build the latest always
if [ -z "$1" ]
then
    # Create both version and latest version
    docker build -t ghcr.io/jhderojasuva/analyted-backend-todo/analyted-backend:$1 .
    docker build -t ghcr.io/jhderojasuva/analyted-backend-todo/analyted-backend:latest .
else
    # Create only latest version
    docker build -t ghcr.io/jhderojasuva/analyted-backend-todo/analyted-backend:latest .
fi
