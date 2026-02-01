FROM node:20-alpine
WORKDIR /app
# # Install nodemon globally for hot-reloading
# RUN npm install -g nodemon
COPY package*.json ./
RUN npm install
COPY . .

ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "server.js"]