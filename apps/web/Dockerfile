FROM node:24-slim
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages/contracts packages/contracts
RUN npm ci --ignore-scripts
COPY apps/web apps/web
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "apps/web"]
