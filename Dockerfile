FROM oven/bun:latest

WORKDIR /app

RUN apt-get update && apt-get install -y curl

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/healthcheck || exit 1

CMD ["bun", "run", "src/index.ts"]
