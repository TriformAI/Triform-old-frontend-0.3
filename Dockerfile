FROM oven/bun:1-alpine
WORKDIR /app

RUN apk add --no-cache git python3 make g++

COPY package.json bun.lockb .
RUN bun install

COPY . .

RUN bun run build

WORKDIR /app/build

USER bun

ENTRYPOINT ["bun", "index.js"]
