FROM quay.io/eypzgod/izumi:latest

WORKDIR /izumi-bot
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.js"]
