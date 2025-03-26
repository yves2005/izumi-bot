FROM quay.io/eypzgod/izumi:latest
RUN git clone https://github.com/Akshay-Eypz/izumi-bot /root/bot/
WORKDIR /root/bot/
RUN npm install -f
CMD ["npm", "start"]
