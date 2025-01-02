 FROM node:22.12 AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y g++ make python3

COPY package.json yarn.lock tsconfig.json .prettierrc .eslintrc ./

COPY /packages/local-mail-watcher/src ./packages/local-mail-watcher/src
COPY /packages/local-mail-watcher/package.json ./packages/local-mail-watcher/package.json
COPY /packages/local-mail-watcher/tsconfig.json ./packages/local-mail-watcher/tsconfig.json
COPY /packages/utils/package.json ./packages/utils/package.json

RUN yarn install --pure-lockfile --timeout 100000

COPY /packages/utils ./packages/utils

RUN yarn workspace @omnivore/utils build && yarn workspace @omnivore/local-mail-watcher build

FROM node:22.12-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/packages/local-mail-watcher/dist /app/packages/local-mail-watcher/dist
COPY --from=builder /app/packages/local-mail-watcher/package.json /app/packages/local-mail-watcher/package.json
COPY --from=builder /app/packages/local-mail-watcher/node_modules /app/packages/local-mail-watcher/node_modules
COPY --from=builder /app/packages/utils/ /app/packages/utils/


COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

CMD ["yarn", "workspace", "@omnivore/local-mail-watcher", "start"]
