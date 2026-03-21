FROM node:20-alpine AS deps
WORKDIR /app

COPY shared ./shared
COPY services/payment-service/package*.json ./
RUN sed -i 's|"@pocket/shared": "file:../../shared"|"@pocket/shared": "file:./shared"|' package.json 2>/dev/null || true && \
    npm install --omit=dev --no-audit --no-fund && \
    npm cache clean --force
RUN mkdir -p /app/node_modules

FROM node:20-alpine AS runtime
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared ./shared
COPY services/payment-service .

RUN rm -rf tests test .env* *.md

ENV NODE_ENV=production
ENV PORT=3005

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3005/health || exit 1

CMD ["node", "server.js"]
