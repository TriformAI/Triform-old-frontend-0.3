FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lockb .
RUN bun install

COPY . .

RUN bun run build


FROM oven/bun:1-alpine
WORKDIR /app

COPY --from=builder /app/build/ /app/build/
COPY package.json bun.lockb .

# Keep only production deps in the final image
RUN bun install --production

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app/build

CMD ["bun", "run", "index.js"]