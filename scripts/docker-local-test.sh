#!/bin/bash

# Prepare new image
sudo docker buildx build --platform linux/amd64 -t mancontr/nanonvr:latest --load .

# Run it
docker run -it -v $(pwd)/data:/media -v $(pwd)/data:/config -p 8099:8099 --name nanonvr-test --rm  mancontr/nanonvr:latest
