#!/bin/bash
## Get version
VERSION=$1

# If you don't say the version it will build the latest always
if [ -z "$1" ]
then
    docker build -t ghcr.io/analyted-backend:$1 .
else
    docker build -t ghcr.io/analyted-backend:latest .
fi
