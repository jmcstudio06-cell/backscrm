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
# Copy frontend dist to the root of the app where server.js is
COPY --from=frontend-builder /app/frontend/dist ./dist

EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# Now server.js is at the root
CMD ["node", "server.js"]
