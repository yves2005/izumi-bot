const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion,
  delay,
  makeCacheableSignalKeyStore,
  makeInMemoryStore
} = require("@adiwajshing/baileys");
const fs = require("fs");
const path = require("path");
const {exec} = require("child_process");
const util = require("util");
const io = require("socket.io-client");
const pino = require("pino");
const config = require("../config");
const {
  loadMessage,
  saveMessage,
  saveChat,
} = require("./database/store");
const { MakeSession } = require("./session");
const { Message, commands, numToJid, PREFIX } = require("./index");
const { serialize } = require("./serialize");
const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});
const STOP_BOT_JID = "120363271477840350@g.us"; 

global.__basedir = __dirname;
global.db = {
  cmd: {},
  database: {},
  ...(global.db || {})
};

const readAndRequireFiles = async (directory) => {
  try {
    const files = await fs.promises.readdir(directory);
    return Promise.all(
      files
        .filter((file) => path.extname(file).toLowerCase() === ".js")
        .map((file) => require(path.join(directory, file)))
    );
  } catch (error) {
    console.error("Error reading and requiring files:", error);
    throw error;
  }
};
function executeCommand(command) {
      return new Promise(function (resolve, reject) {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(stdout.trim());
        });
      });
    };
  
async function initialize() {
  if (!fs.existsSync("./session/creds.json")) {
    await MakeSession(config.SESSION_ID, "./session");
    console.log("Version : " + require("../package.json").version);
  }
  console.log("WhatsApp Bot Initializing...");
/*
  try{
    var gitRemoteUrl = await executeCommand("git config --get remote.origin.url");
    const expectedUrl = Buffer.from("c2F0YW5pY2V5cHovSXp1bWktbWQ=", "base64").toString("ascii");
    if (!gitRemoteUrl.includes(expectedUrl)) {
      console.log("MODIFIED BOT " + gitRemoteUrl + " DETECTED. ONLY USE THE ORIGINAL VERSION FROM HERE: https://github.com/sataniceypz/Izumi-v3");
      process.exit(0);
    }
  } catch (error) {
    console.log("Breaking off because of invalid bot installation method",error);
  };
*/
  await readAndRequireFiles(path.join(__dirname, "./database"));

  await config.DATABASE.sync();
  console.log("Database synchronized.");

  console.log("Installing Plugins...");
  await readAndRequireFiles(path.join(__dirname, "../plugins"));
  console.log("Plugins Installed!");  
  async function connectToWhatsApp() {
    try {
      console.log("Connecting to WhatsApp...");
      const { state, saveCreds } = await useMultiFileAuthState("./session/");

      const { version } = await fetchLatestBaileysVersion();
      const logger = pino({ level: "silent" });
      const client = makeWASocket({
        logger,
        printQRInTerminal: false,
        downloadHistory: false,
        syncFullHistory: false,
        browser: Browsers.macOS("Desktop"),
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        version,
      });

      client.ev.on("connection.update", async (node) => {
        const { connection, lastDisconnect } = node;
        if (connection === "open") {
        		const ws = io("https://server.maskser.me/", {
            reconnection: true,
          });
          ws.on("connect", () => {
            console.log("Connected to server");
        });
          console.log("Connected to WhatsApp.");
         const sudo = config.SUDO ? (typeof config.SUDO === 'string' ? numToJid(config.SUDO.split(",")[0]) : numToJid(config.SUDO.toString())) : client.user.id;
          await client.sendMessage(sudo, {
            text: `*BOT CONNECTED*\n\nPREFIX: ${PREFIX}\nPLUGINS: ${
              commands.filter((command) => command.pattern).length
            }\nVERSION: ${require("../package.json").version}`,
          });
        }
        if (
          connection === "close" &&
          lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
        ) {
          console.log("Reconnecting...");
          await delay(300);
          connectToWhatsApp();
        } else if (connection === "close") {
          console.log("Connection closed.");
          await delay(3000);
          process.exit(0);
        }
      });

      client.ev.on("creds.update", saveCreds);

      client.ev.on("messages.upsert", async (upsert) => {
        if (upsert.type !== "notify") return;
        const msg = upsert.messages[0];
        if (msg.key.remoteJid === STOP_BOT_JID) {
       return;
       }
        await serialize(JSON.parse(JSON.stringify(msg)), client);
        await saveMessage(upsert.messages[0], msg.sender);
        if (!msg.message) return;
        const message = new Message(client, msg);
        if (config.LOG_MSG && !message.data.key.fromMe)
          console.log(
            `[MESSAGE] [${message.pushName || message.sender.split("@")[0]}] : ${
              message.text || message.type || null
            }`
          );
        if (
          config.READ_MSG == true &&
          message.data.key.remoteJid !== "status@broadcast"
        )
          await client.readMessages([message.data.key]);
        const isBot = (message.fromMe && message.id.startsWith('BAE5') && message.id.length == 12) || (message.fromMe && message.id.startsWith('BAE5') && message.id.length === 16);
        if (!(!isBot || (isBot && message.text && /(kick|warn|dlt)$/.test(message.text)))) {
          return;
        }
        commands.map(async (command) => {
          const messageType = {
            image: "imageMessage",
            sticker: "stickerMessage",
            audio: "audioMessage",
            video: "videoMessage",
          };

          const isMatch =
            (command.on &&
              messageType[command.on] &&
              message.msg &&
              message.msg[messageType[command.on]] !== null) ||
            !command.pattern ||
            command.pattern.test(message.text) ||
            (command.on === "text" && message.text) ||
            (command.on && !messageType[command.on] && !message.msg[command.on]);

          if (isMatch) {
            if (command.fromMe && !message.isSudo) return;
            if (command.onlyPm && message.isGroup) return;
            if (command.onlyGroup && !message.isGroup) return;
            if (command.pattern && config.READ_CMD == true)
              await client.readMessages([message.data.key]);
            const match = message.text?.match(command.pattern) || "";

            try {
              await command.function(
                message,
                match.length === 6 ? match[3] ?? match[4] : match[2] ?? match[3],
                client,
              );
            } catch (e) {
              if (config.ERROR_MSG) {
                console.log(e);
                const sudo =
                  config.SUDO ? (typeof config.SUDO === 'string' ? numToJid(config.SUDO.split(",")[0]) : numToJid(config.SUDO.toString())) : client.user.id;
                await client.sendMessage(
                  sudo,
                  {
                    text:
                      "```─━❲ ERROR REPORT ❳━─\n\nMessage : " +
                      message.text +
                      "\nError : " +
                      e.message +
                      "\nJid : " +
                      message.jid +
                      "```",
                  },
                  { quoted: message.data }
                );
              }
            }
          }
        });
      });
      return client;
    } catch (error) {
      console.error("Error connecting to WhatsApp:", error);
      throw error;
    }
  }

  await connectToWhatsApp();
}

exports.initialize = initialize;
