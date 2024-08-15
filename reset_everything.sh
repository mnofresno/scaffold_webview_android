#!/bin/bash

docker stop android-build
docker rm android-build
sudo rm -rf platforms
sudo rm -rf node_modules
sudo rm -rf www
sudo rm -rf .gradle
sudo rm -rf plugins
