ARG CYPHER_VERSION=latest

FROM node:22-alpine AS base

FROM falkordb/text-to-cypher:${CYPHER_VERSION} AS cypher

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install supervisor
RUN apk add --no-cache supervisor

# Remove npm to reduce attack surface (Next.js standalone doesn't need it)
RUN npm cache clean --force && \
    rm -rf /usr/local/lib/node_modules/npm

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next && \
    mkdir -p /text-to-cypher
RUN chown nextjs:nodejs .next && \
    chown -R nextjs:nodejs /text-to-cypher

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.env.local.template ./.env.local
COPY --from=cypher --chown=nextjs:nodejs /app /text-to-cypher


# Create supervisor directories and copy config
RUN mkdir -p /etc/supervisor/conf.d /var/log/supervisor
COPY ./entrypoint.sh /entrypoint.sh
COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN chmod +x /entrypoint.sh

EXPOSE 3000 8080 3001

ENV PORT=3000
ENV REST_PORT=8080
ENV MCP_PORT=3001
ENV TEXT_TO_CYPHER=1
ENV HOSTNAME="0.0.0.0"

# Use root to run supervisord (it will drop privileges for individual services)
USER root

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["/entrypoint.sh"]
