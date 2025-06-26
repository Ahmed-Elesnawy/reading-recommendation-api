# Base stage for shared settings
FROM node:20-alpine as base
# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Development stage
FROM base as development
WORKDIR /usr/src/app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies)
RUN pnpm install

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application in watch mode
CMD ["pnpm", "run", "start:dev"] 