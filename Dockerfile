# =========================
# STAGE 1 - BUILD
# =========================
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files trước để tận dụng cache layer
COPY package*.json ./

# Cài dependencies (devDependencies vẫn cần cho build NestJS)
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build project (NestJS build ra thư mục dist/)
RUN npm run build

# =========================
# STAGE 2 - RUNTIME
# =========================
FROM node:24-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài production dependencies
RUN npm ci --omit=dev

# Copy dist từ builder stage
COPY --from=builder /app/dist ./dist

# Expose port NestJS
EXPOSE 3000

# Chạy app
CMD ["node", "dist/main.js"]
