#### IZUMI WHATSAPP BOT
Izumi - Simple whatsapp Multi Device whatsapp bot.   
### SETUP
1. [![Fork](https://img.shields.io/github/forks/Akshay-Eypz/izumi-bot?style=social)](https://github.com/Akshay-Eypz/izumi-bot/fork)
2.  pair and copy it
    <br>
<a href='https://izumi-pair-mega.onrender.com/' target="_blank"><img alt='SESSION' src='https://img.shields.io/badge/SESSION-100000?style=for-the-badge&logo=scan&logoColor=white&labelColor=black&color=black'/></a>

---
 
### Try this if you didn't get the session ID from the web.
1.  Termux
    <br>
<a href='https://www.mediafire.com/file/iogcejb8629yv63/base.apk/file' target="_blank"><img alt='Install Termux' src='https://img.shields.io/badge/Install Termux-V2100000?style=for-the-badge&logo=scan&logoColor=white&labelColor=black&color=black'/></a>

2. download termux and run the command
    ```
   pkg update && pkg install -y nodejs git && git clone https://github.com/sataniceypz/izumi-qr.git && cd izumi-qr && npm install && node index.js
   ```
### DEPLOY TO RENDER 

1. If You don't have a account in render. Create a account.
    <br>
<a href='https://dashboard.render.com/register' target="_blank"><img alt='render' src='https://img.shields.io/badge/-Create-black?style=for-the-badge&logo=render&logoColor=white'/></a>


2. Get [Render api key](https://dashboard.render.com/u/settings#api-keys)

3. Now Deploy
    <br>
<a href='https://render.com/deploy?repo=https://github.com/Akshay-Eypz/izumi-bot' target="_blank"><img alt='DEPLOY' src='https://img.shields.io/badge/-DEPLOY-black?style=for-the-badge&logo=render&logoColor=white'/></a>


### DEPLOY TO KOYEB
1. Create account on Koyeb
   <br>
<a href='https://koyeb.com' target="_blank"><img alt='Koyeb' src='https://img.shields.io/badge/-Create-black?style=for-the-badge&logo=koyeb&logoColor=white'/></a>

2. Get [Koyeb api key](https://app.koyeb.com/account/api)

3. Deploy on Koyeb
   <br>
<a href='https://izumiiii-bot.vercel.app/koyeb' target="_blank"><img alt='Deploy' src='https://img.shields.io/badge/-Deploy-black?style=for-the-badge&logo=koyeb&logoColor=white'/></a>
 
### RUN ON VPS/TERMUX

1. Install packages
   ```
   apt update && apt upgrade -y && pkg install wget openssl-tool proot -y && hash -r && wget https://raw.githubusercontent.com/EXALAB/AnLinux-Resources/master/Scripts/Installer/Ubuntu/ubuntu.sh && bash ubuntu.sh
   ./start-ubuntu.sh
   apt update && apt upgrade
   apt install sudo
   sudo apt install ffmpeg
   sudo apt install imagemagick
   sudo apt install yarn
   sudo apt install git
   sudo apt install curl
   sudo apt -y remove nodejs
   curl -fsSl https://deb.nodesource.com/setup_lts.x | sudo bash - && sudo apt -y install nodejs
   ```
2. installation
   ```
   git clone https://github.com/Akshay-Eypz/izumi-bot
   cd Izumi-bot
   rm -rf package-lock.json
   npm install @adiwajshing/baileys
   npm install file-type@16
4. Configuration
   ```
   echo "TERMUX = true
   SESSION_ID = null
   PREFIX = .
   SUDO = null" > config.env
   ```
- Start
  ```
  npm install
  npm start
  ```
- Stop
  ```
  pm2 delete izumi

  
[![Join us on Telegram](https://img.shields.io/badge/Join_Telegram-blue?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/izumi_support)

<a href="https://whatsapp.com/channel/0029Vaf2tKvGZNCmuSg8ma2O"><img alt="WhatsApp" src="https://img.shields.io/badge/-Whatsapp%20Channel-white?style=for-the-badge&logo=whatsapp&logoColor=black"/></a>
