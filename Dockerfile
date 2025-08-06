# Use official Node.js LTS image
FROM node:20-alpine

# Create a non-root user and group
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory and change ownership
WORKDIR /app
RUN chown -R appuser:appgroup /app

# Switch to non-root user early
USER appuser

# Copy package files and install dependencies
COPY --chown=appuser:appgroup --chmod=444 package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copy only the necessary application code
COPY --chown=appuser:appgroup --chmod=444 src/ ./src/
RUN find src/ -type d -exec chmod 555 {} \;

# Expose the port your Fastify app runs on
EXPOSE 3010

# Start the Fastify server
CMD ["npm", "start"]