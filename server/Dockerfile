# Use a lightweight Node.js image
FROM node:18-slim

# 1. Install Docker CLI (Crucial: Allows this container to spawn sibling containers)
RUN apt-get update && apt-get install -y docker.io

# 2. Setup App
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# 3. Expose Port
EXPOSE 5000

# 4. Start
CMD ["node", "index.js"]