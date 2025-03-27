FROM quay.io/eypzgod/izumi:latest

WORKDIR /root/bot/

EXPOSE 3000

RUN git clone https://github.com/Akshay-Eypz/izumi-bot /root/bot/

RUN yarn install --network-concurrency 1

CMD ["npm", "start"]
