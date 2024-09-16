# Development Stage
FROM node:latest AS development

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .


# Install TypeScript globally (if needed)
RUN npm install -g typescript
RUN npm install -g dotenv
RUN npx prisma generate

# Install nodemon for live reloading


# Expose the port the app runs on
EXPOSE 3004

# Command to start the application in development mode
CMD ["npm", "run", "dev"]
