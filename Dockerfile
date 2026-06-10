# Build stage
FROM node:20 AS builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install --legacy-peer-deps
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Final stage
FROM node:20
WORKDIR /app
# Copy the entire .output folder which contains server and public
COPY --from=builder /app/frontend/.output ./

EXPOSE 7860
ENV PORT=7860
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# The standard TanStack Start entry point
CMD ["node", "server/index.mjs"]
