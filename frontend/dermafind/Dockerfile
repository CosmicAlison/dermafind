# Stage 1: build the frontend
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your source code
COPY . .

# Build production-ready static files
RUN npm run build

# Stage 2: serve with Nginx
FROM nginx:alpine

# Copy the build output to Nginx's default folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]