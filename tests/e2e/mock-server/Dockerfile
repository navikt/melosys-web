# melosys-api Mock Server Dockerfile
#
# Build:  docker build -t melosys-api-mock .
# Run:    docker run -p 8080:8080 -v ./recordings:/recordings melosys-api-mock

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create recordings directory
RUN mkdir -p /recordings && chown -R appuser:appgroup /recordings

# Mount point for recordings
VOLUME /recordings

# Environment configuration
ENV PORT=8080
ENV RECORDINGS_PATH=/recordings
ENV NODE_ENV=production
ENV LOG_REQUESTS=true

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run as non-root user
USER appuser

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/server.js"]
