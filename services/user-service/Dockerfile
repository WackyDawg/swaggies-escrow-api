FROM node:20-slim AS deps
WORKDIR /app

COPY shared ./shared
COPY services/user-service/package*.json ./
RUN sed -i 's|"@pocket/shared": "file:../../shared"|"@pocket/shared": "file:./shared"|' package.json 2>/dev/null || true && \
    npm install --omit=dev --no-audit --no-fund || (cat /root/.npm/_logs/* && exit 1)
RUN mkdir -p /app/node_modules

FROM node:20-slim AS runtime
WORKDIR /app

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared ./shared
COPY services/user-service .

RUN sed -i 's|"@pocket/shared": "file:../../shared"|"@pocket/shared": "file:./shared"|' package.json && \
    rm -rf tests test .env* *.md

ENV NODE_ENV=production
ENV PORT=3002

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3002
EXPOSE 5002

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (res) => process.exit(res.statusCode===200?0:1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
