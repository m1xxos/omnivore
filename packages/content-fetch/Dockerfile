FROM node:18.16-alpine
LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

# Installs latest Chromium package and other dependencies.
RUN apk update && apk add --no-cache \
    chromium \
    firefox-esr \
    ca-certificates \
    nodejs \
    yarn \
    g++ \
    make \
    python3 && \
    rm -rf /var/cache/apk/*

WORKDIR /app

ENV CHROMIUM_PATH=/usr/bin/chromium
ENV FIREFOX_PATH=/usr/bin/firefox
ENV LAUNCH_HEADLESS=true

COPY package.json yarn.lock tsconfig.json .prettierrc .eslintrc ./
COPY /packages/content-fetch/package.json ./packages/content-fetch/package.json
COPY /packages/content-handler/package.json ./packages/content-handler/package.json
COPY /packages/puppeteer-parse/package.json ./packages/puppeteer-parse/package.json
COPY /packages/utils/package.json ./packages/utils/package.json

RUN yarn install --pure-lockfile

COPY /packages/content-fetch ./packages/content-fetch
COPY /packages/content-handler ./packages/content-handler
COPY /packages/puppeteer-parse ./packages/puppeteer-parse
COPY /packages/utils ./packages/utils

RUN yarn workspace @omnivore/utils build && \
    yarn workspace @omnivore/content-handler build && \
    yarn workspace @omnivore/puppeteer-parse build && \
    yarn workspace @omnivore/content-fetch build && \
    rm -rf /app/packages/content-fetch/node_modules /app/node_modules && \
    yarn install --pure-lockfile --production

EXPOSE 8080

# In Firefox we can't use the adblocking sites. Adding them to the hosts file of the docker seems to work.
RUN wget https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts 
RUN echo "#!/bin/sh \n\
cat hosts >> /etc/hosts \n\
yarn workspace @omnivore/content-fetch start" >> ./start.sh && \
chmod +x ./start.sh

CMD ["./start.sh"]
