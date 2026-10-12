FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies ONLY (standalone)
RUN npm install --omit=optional

# Copy backend source
COPY backend/tsconfig.json ./
COPY backend/src ./src

# Copy Prisma schema
COPY database ./database

# Generate Prisma client
RUN npx prisma generate --schema=./database/prisma/schema.prisma

# Compile TypeScript
RUN npx tsc -p tsconfig.json

EXPOSE 4100

CMD ["node", "dist/server.js"]
