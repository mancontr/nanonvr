#!/bin/bash

TAG=$(cat package.json | grep version | cut -d\" -f4)
sudo docker buildx build --platform linux/amd64,linux/arm64 -t mancontr/nanonvr:latest -t mancontr/nanonvr:${TAG} --push .
