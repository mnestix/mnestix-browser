FROM node:18-alpine as base

FROM base as deps
WORKDIR /app
COPY package*.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Comment the following line to enable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED 1

FROM deps as builder
WORKDIR /app
COPY . .

RUN yarn build

FROM base as production
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
EXPOSE 3000
ENV PORT 3000

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/dist/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/dist/static ./public/_next/static

COPY ./scripts scripts

ENTRYPOINT [ "/bin/sh" ]
CMD [ "/app/scripts/start.sh" ]

FROM deps as dev
ENV NODE_ENV=development
COPY . .

CMD yarn dev
