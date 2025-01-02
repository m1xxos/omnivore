FROM node:22.12-alpine AS builder

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apk update && apk add g++ make python3 py3-setuptools && rm -rf /var/cache/apk/*

COPY package.json yarn.lock tsconfig.json .prettierrc .eslintrc ./
COPY packages ./packages

# Remove all except needed packages
RUN cd packages && \
    find . -mindepth 1 -maxdepth 1 -type d \
    ! -name "api" \
    ! -name "readabilityjs" \
    ! -name "text-to-speech" \
    ! -name "content-handler" \
    ! -name "liqe" \
    ! -name "utils" \
    -exec rm -rf {} + && \
    yarn install --pure-lockfile && \
    yarn workspace @omnivore/utils build && \
    yarn workspace @omnivore/text-to-speech-handler build && \
    yarn workspace @omnivore/content-handler build && \
    yarn workspace @omnivore/liqe build && \
    yarn workspace @omnivore/api build && \
    rm -rf /app/packages/api/node_modules /app/node_modules && \
    yarn install --pure-lockfile --production --network-timeout 1000000

FROM node:22.12-alpine AS runner
LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

RUN apk update && apk add netcat-openbsd && rm -rf /var/cache/apk/*

WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV PORT=8080

COPY --from=builder /app /app

EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/api", "start"]
