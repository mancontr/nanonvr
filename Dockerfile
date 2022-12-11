# Build the app only on build platform
FROM --platform=$BUILDPLATFORM node:14 AS build
WORKDIR /app/

COPY package.json yarn.lock /app/
RUN yarn --frozen-lockfile

COPY . /app/
RUN yarn build


# On other platforms, install only runtime dependencies
# and copy build artifacts
FROM node:14

ENV DATA_DIR=/share/nanonvr PORT=8099
EXPOSE 8099/tcp 21821/tcp 21822/tcp
VOLUME /share
VOLUME /data

# Prepare dependencies
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app/
COPY package.json yarn.lock /app/
RUN yarn --production --frozen-lockfile && yarn cache clean

# Copy the build
COPY --from=build /app/build /app/build

# Just run the build when needed
CMD [ "yarn", "serve" ]
