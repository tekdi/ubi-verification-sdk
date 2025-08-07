# Use official Node.js LTS image
FROM node:20-alpine

# Create a non-root user and group
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory and change ownership
WORKDIR /app
RUN chown -R appuser:appgroup /app

# Copy package files as root and set strict permissions immediately
COPY package*.json ./
RUN chown appuser:appgroup package*.json && \
    chmod 444 package*.json

# Switch to non-root user for npm install
USER appuser
RUN npm ci --only=production --ignore-scripts

# Switch back to root to copy source with strict permissions
USER root
COPY src/ ./src/
RUN chown -R appuser:appgroup src/ && \
    find src/ -type f -exec chmod 444 {} \; && \
    find src/ -type d -exec chmod 555 {} \;

# Switch back to non-root user for runtime
USER appuser

# Expose the port your Fastify app runs on
EXPOSE 3010

# Start the Fastify server
CMD ["npm", "start"]