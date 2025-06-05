FROM oven/bun:1-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y git python3 make g++

COPY package.json bun.lockb .
RUN bun install

COPY . .

RUN bun run build


FROM oven/bun:1-slim
WORKDIR /app

COPY --from=builder /app/build/ /app/build/
COPY package.json bun.lockb .

# Keep only production deps in the final image
RUN bun install --production

WORKDIR /app/build

USER bun

# temporarily add curl for debugging
RUN apt-get update && apt-get install -y curl

ENTRYPOINT ["bun", "index.js"]
