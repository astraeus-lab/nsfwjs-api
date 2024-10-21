FROM node:20.18.0-bullseye-slim AS builder
  
WORKDIR /app

COPY . .

RUN apt-get update && \
    apt-get install -y build-essential libc6-dev tzdata && \
    rm -rf /var/lib/apt/lists/* && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    npm install -g pnpm && pnpm install && pnpm build && rm -rf node_modules

FROM node:20.18.0-bullseye-slim

WORKDIR /app

COPY --from=builder /app /app

RUN apt-get update && \
    apt-get install -y build-essential libc6-dev tzdata && \
    rm -rf /var/lib/apt/lists/* && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    npm install -g pnpm && pnpm install --production

EXPOSE 3000

CMD ["pnpm", "start"]
