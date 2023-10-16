from node:lts-buster as base
WORKDIR /usr/app
COPY package.json .
RUN apt install git python3
RUN corepack enable pnpm
RUN npm i -g typescript
RUN pnpm install
COPY . .
