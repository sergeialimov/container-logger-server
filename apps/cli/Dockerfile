# Base Image
FROM node:21

WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Build the CLI app
RUN yarn nx build cli

# Command to run the CLI app
CMD ["node", "dist/apps/cli/main.js"]
