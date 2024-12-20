FROM node:22.12-alpine AS builder

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apk update && apk add g++ make python3 && rm -rf /var/cache/apk/*

COPY package.json yarn.lock tsconfig.json .prettierrc .eslintrc ./
COPY packages ./packages

# Remove all except needed packages
RUN find packages -mindepth 1 -type d \
    ! -regex '^packages/\(api\|readabilityjs\|text-to-speech\|content-handler\|liqe\|utils\)\(/.*\)?' \
    -exec rm -rf {} +

RUN yarn install --pure-lockfile && \
    yarn workspace @omnivore/utils build && \
    yarn workspace @omnivore/text-to-speech-handler build && \
    yarn workspace @omnivore/content-handler build && \
    yarn workspace @omnivore/liqe build && \
    yarn workspace @omnivore/api build && \
    rm -rf /app/packages/api/node_modules /app/node_modules && \
    yarn install --pure-lockfile --production

FROM node:22.12-alpine AS runner
LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

RUN apk update && apk add netcat-openbsd && rm -rf /var/cache/apk/*

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app /app


CMD ["yarn", "workspace", "@omnivore/api", "start_queue_processor"]
