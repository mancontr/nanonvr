FROM node:14

ENV DATA_DIR=/share/nanonvr PORT=8099
EXPOSE 8099/tcp
VOLUME /share

# Prepare dependencies
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app/
COPY package.json yarn.lock /app/
RUN yarn

# Make a build
COPY . /app/
RUN yarn build

# Just run the build when needed
CMD [ "yarn", "serve" ]
