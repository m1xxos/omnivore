FROM node:18.16-alpine
LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

# Installs latest Chromium package.
RUN apk update && apk add \
    ca-certificates \
    chromium \
    firefox-esr \
    g++ \
    make \
    nodejs \
    python3 \
    yarn && \
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

COPY /packages/content-fetch /packages/content-handler /packages/puppeteer-parse /packages/utils ./packages/

RUN yarn workspace @omnivore/utils build && \
    yarn workspace @omnivore/puppeteer-parse build && \
    yarn workspace @omnivore/content-handler build && \
    yarn workspace @omnivore/content-fetch build && \
    rm -rf /app/packages/content-fetch/node_modules && \
    rm -rf /app/node_modules && \
    yarn install --pure-lockfile --production

EXPOSE 8080

# In Firefox we can't use the adblocking sites. Adding them to the hosts file of the docker seems to work.
RUN wget https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts && \
    echo "#!/bin/bash \n\
    cat hosts >> /etc/hosts \n\
    yarn workspace @omnivore/content-fetch start" >> ./start.sh && \
    chmod +x ./start.sh

CMD ["./start.sh"]

