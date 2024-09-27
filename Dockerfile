# Base image for Node.js
FROM node:20-alpine AS base

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -g nodemon
# Copy the rest of the application code
COPY . .
RUN npx prisma generate
# Expose the port your app runs on
EXPOSE 3005

# Start the application
CMD ["npm", "run", "dev"]
