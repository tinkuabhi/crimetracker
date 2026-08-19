FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install

COPY backend ./backend
COPY shared ./shared

RUN npm run build --workspace backend

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/package.json ./backend/package.json

EXPOSE 3000

CMD ["node", "backend/dist/server.js"]