FROM quay.io/eypzgod/izumi:latest

RUN git clone https://github.com/Akshay-Eypz/izumi-bot /root/bot/
WORKDIR /root/bot/
RUN npm install
RUN npm install -g pm2
CMD ["npm", "start"]
