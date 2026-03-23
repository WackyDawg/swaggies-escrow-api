FROM node:20-slim AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && \
    npm cache clean --force
RUN mkdir -p /app/node_modules

FROM node:20-slim AS runtime
WORKDIR /app

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN rm -rf tests test .env* *.md

ENV NODE_ENV=production
ENV PORT=3000

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/ping', (res) => process.exit(res.statusCode===200?0:1)).on('error', () => process.exit(1))"

CMD ["node", "./src/server.js"]
