#!/bin/bash

sudo docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t mancontr/nanonvr:latest --push .
