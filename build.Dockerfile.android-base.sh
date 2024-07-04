#!/bin/bash

IMAGE_NAME="ghcr.io/mnofresno/android-alpine-build-base:1.0.0"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --push) PUSH=true ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

docker build -f Dockerfile.android-base -t $IMAGE_NAME .

if [ "$PUSH" = true ]; then
    docker push $IMAGE_NAME
fi
