FROM node:20-alpine AS build
WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# Nginx stage
FROM nginx:alpine

# Copy the build output to Nginx's public directory
COPY --from=build /app/dist/valentines/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]