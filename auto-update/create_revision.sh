#!/bin/bash

cd "$(dirname "$0")"

echo "window.buildRevision = {sha1:\"$(git rev-parse HEAD)\"};" > ./public/revision.js
cp ./public/revision.js ../src/js/
