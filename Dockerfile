# Use the latest Node.js 20 LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the app's port (default to 3000)
EXPOSE 8081

# Start the server
CMD ["node", "server.js"]
