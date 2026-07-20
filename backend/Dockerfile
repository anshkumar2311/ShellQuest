FROM node:20-bookworm

# node-pty compiles a native addon at install time — it needs a C++ toolchain
# and Python. Installing these here means node-pty always builds correctly,
# regardless of the host OS (Windows/Mac/Linux) running Docker.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
