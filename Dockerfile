# Multi-stage Dockerfile for QuantumShield
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source trees
COPY shared ./shared
COPY backend ./backend
COPY frontend ./frontend

# Build projects
RUN cd backend && npm run build
RUN cd frontend && npm run build

# Production Runtime Image
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

COPY backend/package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/frontend/dist ./public-frontend
COPY test-fixtures ./test-fixtures

EXPOSE 5001

CMD ["node", "dist/server.js"]
