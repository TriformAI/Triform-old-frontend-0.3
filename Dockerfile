FROM oven/bun:1-slim AS builder
WORKDIR /app

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
ENTRYPOINT ["bun", "index.js"]
