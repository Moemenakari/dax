FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/backend/package*.json packages/backend/
RUN npm install
COPY packages/backend ./packages/backend
COPY tsconfig.json ./
RUN npm run build --workspace=packages/backend

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY packages/backend/package*.json packages/backend/
RUN npm install --omit=dev
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
EXPOSE 5000
CMD ["node", "packages/backend/dist/server.js"]
