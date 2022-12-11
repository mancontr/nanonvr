#!/bin/bash

# Prepare new image
sudo docker buildx build --platform linux/amd64 -t mancontr/nanonvr:latest --load .

# Run it
docker run -it -v data:/share -v data:/data -p 8099:8099  mancontr/nanonvr:latest
