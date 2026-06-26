# Builder image — runs the periodic sheet-sync + rebuild loop and publishes
# the static site into a shared volume. The nginx container (see
# docker-compose.yml) serves that volume. Content updates require no manual
# deploy: edit the Sheet, wait one REBUILD_INTERVAL.
#
# Sheet IDs are NOT baked in here — they're injected at runtime via compose
# `env_file: .env`, because the sync runs in the loop (runtime), not at build.
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source (node_modules / dist / .env excluded via .dockerignore)
COPY . .

# The rebuild loop
COPY docker/rebuild-loop.sh /usr/local/bin/rebuild-loop.sh
RUN chmod +x /usr/local/bin/rebuild-loop.sh \
    && mkdir -p /srv/site

ENV PUBLISH_DIR=/srv/site \
    REBUILD_INTERVAL=300

CMD ["/usr/local/bin/rebuild-loop.sh"]
