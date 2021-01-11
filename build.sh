#!/usr/bin/env sh

IMAGE_NAME=docdoku/docdoku-plm-front
VERSION=$(sed -nE 's/^\s*"version": "(.*?)",$/\1/p' package.json)


npm run build && \
docker build -f docker/Dockerfile -t $IMAGE_NAME:latest . && \
docker tag $IMAGE_NAME:latest $IMAGE_NAME:$VERSION


