# syntax=docker/dockerfile:1
FROM stripe/stripe-cli:v1.51.0 AS stripe
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl fontconfig redis-server tini python3 make g++ lsof \
    && rm -rf /var/lib/apt/lists/*
COPY --from=stripe /bin/stripe /usr/local/bin/stripe
RUN mkdir -p /workspace/BGSNL /workspace/BGSNL-API /workspace/Domakin-Mailer /data/redis \
    && chown -R node:node /workspace /data/redis
COPY --chown=node:node ["BGSNL website/BGSNL/package.json", "BGSNL website/BGSNL/package-lock.json", "/workspace/BGSNL/"]
COPY --chown=node:node ["BGSNL website/BGSNL-API/package.json", "BGSNL website/BGSNL-API/package-lock.json", "/workspace/BGSNL-API/"]
COPY --chown=node:node ["Domakin/Domakin-Mailer/package.json", "Domakin/Domakin-Mailer/package-lock.json", "/workspace/Domakin-Mailer/"]
COPY --chown=node:node ["BGSNL website/BGSNL/docker/dev/dependencies.mjs", "/opt/bgsnl/dependencies.mjs"]
USER node
RUN node /opt/bgsnl/dependencies.mjs
# Seed the named cache volume with node ownership before the bind mount hides it.
RUN mkdir -p /workspace/BGSNL/.next
COPY --chown=node:node ["BGSNL website/BGSNL/", "/workspace/BGSNL/"]
COPY --chown=node:node ["BGSNL website/BGSNL-API/", "/workspace/BGSNL-API/"]
COPY --chown=node:node ["Domakin/Domakin-Mailer/", "/workspace/Domakin-Mailer/"]
ENV NODE_ENV=development APP_ENV=dev BGSNL_MAILER_DIR=/workspace/Domakin-Mailer \
    BGSNL_STRIPE_CLI=/usr/local/bin/stripe BGSNL_REDIS_URL=redis://127.0.0.1:6380/0 \
    WATCHPACK_POLLING=true CHOKIDAR_USEPOLLING=true CHOKIDAR_INTERVAL=1000 \
    NEXT_TELEMETRY_DISABLED=1 FONTCONFIG_PATH=/workspace/BGSNL/docker/dev
WORKDIR /workspace/BGSNL
EXPOSE 3000 8080 6000
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "docker/dev/start.mjs"]
