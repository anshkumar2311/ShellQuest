FROM oven/bun:canary-slim as builder

# node-pty compiles a native addon at install time — it needs a C++ toolchain
# and Python. Installing these here means node-pty always builds correctly,
# regardless of the host OS (Windows/Mac/Linux) running Docker.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

# Copy the rest of the source code before building
COPY . .
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN bunx prisma generate
RUN bun add node-pty
RUN bun build src/server.ts --outdir ./dist --target bun --external node-pty


# --- Runner Stage ---
FROM oven/bun:canary-slim as runner

# The backend needs docker-cli at runtime to spawn player containers
RUN apt-get update && apt-get install -y --no-install-recommends docker-cli \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependencies, built server, and generated Prisma client from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# If prisma generates inside src/generated, copy it
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/Dockerfile.player ./Dockerfile.player

EXPOSE 4000

CMD ["bun", "run", "dist/server.js"]
