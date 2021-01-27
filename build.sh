#!/usr/bin/env sh

set -e

VERSION=$(sed -nE 's/^\s*"version": "(.*?)",$/\1/p' package.json)

npm run build
docker build -f docker/Dockerfile -t docdoku/docdoku-plm-front:$VERSION .
