# Build stage for Frontend
FROM node:20 AS builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install --legacy-peer-deps
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Final stage
FROM node:20
WORKDIR /app
COPY --from=builder /app/frontend/.output ./
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production
CMD ["node", "server/index.mjs"]
