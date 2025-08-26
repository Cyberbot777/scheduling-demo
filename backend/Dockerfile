FROM node:18-alpine

WORKDIR /usr/src/app

# Install deps separately so Docker can cache them
COPY package*.json ./
RUN npm install

# Install ts-node-dev globally for hot reload
RUN npm install -g ts-node-dev

# Copy rest of the code
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

# Use hot reload in dev mode
CMD ["npm", "run", "dev"]
