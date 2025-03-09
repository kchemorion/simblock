FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and global webpack-cli
RUN npm install && npm install -g webpack-cli

# Copy the rest of the frontend code
COPY . .

# Build the app
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]