# Stage 1: Building the code
FROM node:21 AS builder

WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Build the application
RUN yarn nx build server

# Stage 2: Run the server
FROM node:21

WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --production

# Copy built assets from the builder stage
COPY --from=builder /usr/src/app/dist/apps/server ./dist/apps/server

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/apps/server/main.js"]
