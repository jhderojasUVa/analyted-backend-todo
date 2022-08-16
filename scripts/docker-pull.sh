#!/bin/bash
## Get version
VERSION=$1

## This script pulls on container registry
# Remember that you must be login in
if [ -z "$1" ]
then
    docker pull ghcr.io/jhderojasuva/analyted-backend-todo/analyted-backend:$1
else
    docker pull ghcr.io/jhderojasuva/analyted-backend-todo/analyted-backend:latest 
fi
