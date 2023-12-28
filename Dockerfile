FROM node:lts-alpine

# Create app directory
WORKDIR /app

# NOTE: seperate COPY commands to take advantage of Docker's build cache and only rebuild the layers that have changed

  # Copy package.json and package-lock.json to /app
COPY package*.json ./
RUN yarn install

# Copy the rest of the app's source code to /app
COPY . .

# Set the user to NODE user (non-root) to prevent security issues
USER node

# Run the app
CMD ["yarn", "start"]

# Expose port 8080
EXPOSE 8080