FROM node:22.12

WORKDIR /app

COPY package.json yarn.lock tsconfig.json ./

COPY /packages/db/package.json ./packages/db/package.json

RUN apt-get update && apt-get install -y \
  postgresql \
  uuid-runtime && \
  rm -rf /var/lib/apt/lists/* && \
  yarn install --network-timeout 1000000

COPY /packages/db ./packages/db
COPY /packages/db/setup.sh ./packages/db/setup.sh

CMD ["yarn", "workspace", "@omnivore/db", "migrate"]
