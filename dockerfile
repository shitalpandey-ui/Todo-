FROM node:20-alpine

WORKDIR /app

# Copy package files first so dependencies are cached between builds
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the source code
COPY . .

EXPOSE 3000

CMD ["node", "app.js"]