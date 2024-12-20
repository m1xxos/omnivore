FROM node:14.18-alpine

# Run everything after as non-privileged user.
WORKDIR /app

COPY package.json yarn.lock tsconfig.json .eslintrc ./

COPY /packages/queue-manager/package.json ./packages/queue-manager/package.json

RUN yarn install --pure-lockfile

COPY /packages/queue-manager ./packages/queue-manager
RUN yarn workspace @omnivore/queue-manager build && \
    rm -rf /app/packages/queue-manager/node_modules /app/node_modules && \
    yarn install --pure-lockfile --production

EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/queue-manager", "start"]

