# Build stage for Frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Final stage for Backend
FROM node:20
WORKDIR /app
# Copy backend files
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
# Copy frontend public assets to a folder named 'public' next to server.js
COPY --from=frontend-builder /app/frontend/.output/public ./public

EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# Now server.js is at the root
CMD ["node", "server.js"]
