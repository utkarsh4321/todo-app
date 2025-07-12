# # FROM node:lts-alpine
# # # Install dependencies
# # # RUN npm install pm2 -g
# # COPY docker-entrypoint.sh /usr/local/bin/
# # RUN chmod +x /usr/local/bin/docker-entrypoint.sh
# # ENTRYPOINT ["docker-entrypoint.sh"]
# # WORKDIR /app
# # COPY package.json package-lock.json ./
# # RUN npm install
# # COPY . .
# # EXPOSE 4000

# # # CMD ["/bin/sh", "-c", "npm run generate && npm run migrate && rm -rf node_modules && npm run build && node ./dist/server.js"]
# # CMD ["/bin/sh", "-c", "npm run build && node ./dist/server.js"]

FROM node:lts-alpine AS builder
# Install dependencies
WORKDIR /app
COPY docker-entrypoint.js ./docker-entrypoint.js
COPY package.json package-lock.json ./
COPY drizzle.config.ts ./drizzle.config.ts
COPY src/db ./src/db
COPY src/features ./src/features
COPY src/services ./src/services
RUN npm install --silent
COPY . .
RUN npm run build

FROM node:lts-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Install production dependencies + migration tools
RUN npm ci --only=production --silent && \
    npm cache clean --force && \
    rm -rf /tmp/*

FROM node:lts-alpine AS production
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src/db ./src/db
COPY --from=builder app/src/features ./src/features
COPY --from=builder app/src/services ./src/services
# COPY --from=builder /app/docker-entrypoint.js ./docker-entrypoint.js
# ENTRYPOINT ["node", "./docker-entrypoint.js"]
# COPY package-lock.json ./
# Install production dependencies only
# RUN npm run generate
# RUN npm run migrate

EXPOSE 4000
CMD ["/bin/sh", "-c", "node ./dist/server.js"]
# ENTRYPOINT ["./docker-entrypoint.js"]
