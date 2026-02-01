FROM node:20-alpine
WORKDIR /app
# Install Angular CLI globally
RUN npm install -g @angular/cli
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4200
# Run ng serve and allow connections from the proxy
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]