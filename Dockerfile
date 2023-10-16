from node:lts-buster
WORKDIR /usr/app
COPY package.json .
RUN apt install git python3
RUN corepack enable pnpm
RUN npm i -g typescript
RUN pnpm install
COPY . .
