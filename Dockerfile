FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package*.json bun.lockb .
RUN bun install --frozen-lockfile

COPY . .

RUN bun run build


FROM oven/bun:1-alpine
WORKDIR /app

COPY --from=builder /app/build/ /app/build/
COPY --from=builder /app/node_modules/ /app/node_modules/
COPY package.json .

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app/build

CMD ["bun", "run", "start"]