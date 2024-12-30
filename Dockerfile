FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --production


FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/build/ /app/build/
COPY --from=builder /app/node_modules/ /app/node_modules/
COPY package.json .

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["node", "build"]