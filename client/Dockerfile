FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Use 'npm start' for development so hot-reloading works
CMD ["npm", "start"]