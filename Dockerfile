# Build the app only on build platform
FROM --platform=$BUILDPLATFORM node:14-alpine AS build
WORKDIR /app/

COPY package.json yarn.lock /app/
RUN yarn --frozen-lockfile

COPY . /app/
RUN yarn build


# On other platforms, install only runtime dependencies
# and copy build artifacts
FROM node:14-alpine

ENV DATA_DIR=/share/nanonvr CONFIG_DIR=/config PORT=8099 PATH=/usr/local/bin:$PATH
EXPOSE 8099/tcp 21821/tcp 21822/tcp
VOLUME /share
VOLUME /data

# Prepare dependencies
RUN apk add --no-cache ffmpeg tzdata

WORKDIR /app/
COPY package.json yarn.lock /app/
RUN yarn --production --frozen-lockfile && yarn cache clean

# Copy the build
COPY --from=build /app/build /app/build

# Just run the build when needed
CMD [ "yarn", "serve" ]
