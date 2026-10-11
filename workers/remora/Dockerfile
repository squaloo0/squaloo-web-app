# The machine. Built in Phase 3; this is the skeleton.
#
# Node runs the worker; ffmpeg comes from apt; yt-dlp is the standalone Linux binary,
# pinned, so the image has no Python environment to drift.
FROM node:22-slim

ARG YTDLP_VERSION=2025.06.30
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg ca-certificates curl \
 && curl -fsSL "https://github.com/yt-dlp/yt-dlp/releases/download/${YTDLP_VERSION}/yt-dlp_linux" -o /usr/local/bin/yt-dlp \
 && chmod +x /usr/local/bin/yt-dlp \
 && apt-get purge -y curl && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# Only what the worker needs: the pure core and the worker itself. No Next build.
COPY package.json ./
COPY src/remora ./src/remora
COPY workers/remora ./workers/remora

ENV NODE_ENV=production
CMD ["node", "--experimental-strip-types", "--disable-warning=ExperimentalWarning", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "workers/remora/worker.ts"]
