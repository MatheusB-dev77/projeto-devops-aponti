# ---------- Estágio 1: dependências de produção ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- Estágio 2: imagem final ----------
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

# Roda como usuário sem privilégios (segurança)
RUN mkdir -p logs && chown -R node:node /app
USER node

EXPOSE 3333
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3333/health || exit 1

CMD ["node", "src/server.js"]