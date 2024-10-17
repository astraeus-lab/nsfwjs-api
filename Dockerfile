FROM node:20.18.0-bullseye-slim

WORKDIR /app

COPY . .

RUN apt-get update && \
    apt-get install -y python3 build-essential libc6-dev tzdata && \
    rm -rf /var/lib/apt/lists/* && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    npm install -g pnpm && pnpm install --production && pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
