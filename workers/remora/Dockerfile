# The machine. One always-on box on Fly.io (see fly.toml next to this file).
#
# Node runs the worker; ffmpeg comes from apt; yt-dlp is the standalone Linux binary,
# pinned, so the image has no Python environment to drift. Bump YTDLP_VERSION when the
# extractors break; the receipt records whichever version vended.
FROM node:22-slim

ARG YTDLP_VERSION=2026.08.19
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg ca-certificates curl \
 && curl -fsSL "https://github.com/yt-dlp/yt-dlp/releases/download/${YTDLP_VERSION}/yt-dlp_linux" -o /usr/local/bin/yt-dlp \
 && chmod +x /usr/local/bin/yt-dlp \
 && apt-get purge -y curl && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* \
 && yt-dlp --version && ffmpeg -version | head -1

WORKDIR /app
# Only what the worker needs: its own two-line manifest (the worker imports node:* and
# @neondatabase/serverless, nothing else), the pure core, the I/O edges, the worker.
# Not the site's package.json: that would pull Next into the image. No Next build.
COPY workers/remora/package.json ./package.json
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force
COPY src/remora ./src/remora
COPY workers/remora ./workers/remora

# Vends are staged in the container's tmp and deleted after upload; 1 GB RAM is plenty
# because yt-dlp streams to disk and the upload streams from it.
ENV NODE_ENV=production
ENV REMORA_MACHINE_NAME=fly
CMD ["node", "--experimental-strip-types", "--disable-warning=ExperimentalWarning", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "workers/remora/worker.ts"]
