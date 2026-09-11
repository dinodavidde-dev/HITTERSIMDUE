# Stage 1: Build the Vite application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json ./

# Install dependencies using npm
RUN npm install

# Copy source code
COPY . .

# Build application for production
RUN npm run build

# Stage 2: Production runtime image
FROM node:20-alpine

WORKDIR /app

# Copy package.json and install production dependencies only
COPY package.json ./
RUN npm install --production

# Copy built static assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy production Express server
COPY server.cjs ./

# Expose port 8080
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.cjs"]
