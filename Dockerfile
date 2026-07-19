FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy the rest of the application files
COPY . .

# Cloud Run sets the PORT env variable to 8080 by default
ENV PORT=8080
EXPOSE 8080

# Start the Node.js server
CMD ["npm", "start"]
