FROM node:25-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm install -g pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


FROM node:25-alpine

WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

EXPOSE 3000
ENV NODE_ENV=production

CMD node build