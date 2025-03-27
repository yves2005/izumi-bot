const axios = require("axios");
const {
  jidDecode,
  delay,
  generateWAMessageFromContent,
  proto,
} = require("@adiwajshing/baileys");
const { readFile, unlink } = require("fs/promises");
const fromBuffer = async () => {
    const module = await import("file-type");
    return module.fromBuffer;
};
const fs = require("fs");
const { tmpdir } = require("os");
const id3 = require("browser-id3-writer");
const path = require("path");
const cheerio = require("cheerio");
const FormData = require("form-data");
const { JSDOM } = require("jsdom");
const jimp = require("jimp");
const jsQR = require("jsqr");
const { spawn } = require("child_process");
const { loadMessage } = require("../lib/database/store");
const fetch = require("node-fetch");


async function validatAndSaveDeleted(client, msg) {
  if (msg.type === "protocolMessage") {
    if (msg.message.protocolMessage.type === "REVOKE") {
      await client.sendMessage(msg.key.remoteJid, { text: "Message Deleted" });
      let jid = config.DELETED_LOG_CHAT;
      let message = await loadMessage(msg.message.protocolMessage.key.id);
      const m = generateWAMessageFromContent(jid, message.message, {
        userJid: client.user.id,
      });
      await client.relayMessage(jid, m.message, {
        messageId: m.key.id,
      });
      return m;
    }
  }
}
/**
 * Reads a QR code from an image buffer.
 * @param {Buffer} imageBuffer - The image buffer containing the QR code.
 * @returns {string|null} The decoded QR code data, or null if no QR code was found.
 */
async function readQr(imageBuffer) {
  try {
    const image = await jimp.read(imageBuffer);
    const { data, width, height } = image.bitmap;
    const code = jsQR(data, width, height);
    if (code) {
      return code.data;
    }
  } catch (err) {
    throw new Error(`Error reading QR code: ${err.message}`);
  }
  return null;
}
function createInteractiveMessage(data, options = {}) {
  const { jid, button, header, footer, body } = data;
  let buttons = [];
  for (let i = 0; i < button.length; i++) {
    let btn = button[i];
    let Button = {};
    Button.buttonParamsJson = JSON.stringify(btn.params);
    switch (btn.type) {
      case "copy":
        Button.name = "cta_copy";
        break;
      case "url":
        Button.name = "cta_url";
        break;
      case "location":
        Button.name = "send_location";
        break;
      case "address":
        Button.name = "address_message";
        break;
      case "call":
        Button.name = "cta_call";
        break;
      case "reply":
        Button.name = "quick_reply";
        break;
      case "list":
        Button.name = "single_select";
        break;
      default:
        Button.name = "quick_reply";
        break;
    }
    buttons.push(Button);
  }
  const mess = {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
        },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({ ...body }),
          footer: proto.Message.InteractiveMessage.Footer.create({ ...footer }),
          header: proto.Message.InteractiveMessage.Header.create({ ...header }),
          nativeFlowMessage:
            proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: buttons,
            }),
        }),
      },
    },
  };
  let optional = generateWAMessageFromContent(jid, mess, options);
  return optional;
}

function createMediaDirectoryIfNotExists() {
  const mediaDirectory = path.join(__dirname, '../media');
  if (!fs.existsSync(mediaDirectory)) {
    fs.mkdirSync(mediaDirectory);
  }
}

async function igdl(igurl) {
  const data = `q=${encodeURIComponent(igurl)}&t=media&lang=en`;
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://v3.saveig.app/api/ajaxSearch",
    headers: {
      Accept: "/",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    data: data,
  };

  const response = await axios.request(config);
  const html = response.data.data;

  const $ = cheerio.load(html, { decodeEntities: true });
  const downloadItems = $(".download-items");
  const result = [];

  downloadItems.each((index, element) => {
    let url = $(element).find(".download-items__btn > a").attr("href");
    if (url.includes("file")) {
      let newUrl = new URL(url);
      let encodedUrl = newUrl.searchParams.get("file");
      let decodedUrl = Buffer.from(encodedUrl, "base64").toString("utf-8");
      result.push(decodedUrl);
    } else {
      result.push(url);
    }
  });

  return result;
}
function Imgbb(path) {
  return new Promise(async (resolve) => {
    const imgbbUploader = require('imgbb-uploader');
      const options = {
        'apiKey': "abd267790b2a68310d296a2a3a5b9fb1",
        'imagePath': path
        }
      const result = await imgbbUploader(options);
      if (result.url) {
        return resolve(result.url);
      }
    
  });
}
function aiImage(prompt) {
  return new Promise((resolve, reject) => {
    axios.post('https://socket.xasena.me/generate-image', {
        prompt: prompt
      }, {
        headers: {
          Accept: '*/*',
          'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      })
      .then(function (response) {
        if (response.status === 400) {
          resolve(response.data);
        } else {
          resolve(Buffer.from(response.data, 'binary'));
        }
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

function ffmpeg(buffer, args = [], ext = "", ext2 = "") {
  return new Promise(async (resolve, reject) => {
    try {
      let tmp = path.join(tmpdir() + "/" + new Date() + "." + ext);
      let out = tmp + "." + ext2;
      await fs.promises.writeFile(tmp, buffer);
      const ffmpegProcess = spawn("ffmpeg", ["-y", "-i", tmp, ...args, out])
        .on("error", reject)
        .on("close", async (code) => {
          try {
            await fs.promises.unlink(tmp);
            if (code !== 0) {
              reject(new Error(`FFmpeg process exited with code ${code}`));
              return;
            }
            const processedData = await fs.promises.readFile(out);
            await fs.promises.unlink(out);
            resolve(processedData);
          } catch (e) {
            reject(e);
          }
        });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Convert Audio to Playable WhatsApp Audio
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension
 */
function toAudio(buffer, ext) {
  return ffmpeg(
    buffer,
    ["-vn", "-ac", "2", "-b:a", "128k", "-ar", "44100", "-f", "mp3"],
    ext,
    "mp3"
  );
}

/**
 * Convert Audio to Playable WhatsApp PTT
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension
 */
function toPTT(buffer, ext) {
  return ffmpeg(
    buffer,
    [
      "-vn",
      "-c:a",
      "libopus",
      "-b:a",
      "128k",
      "-vbr",
      "on",
      "-compression_level",
      "10",
    ],
    ext,
    "opus"
  );
}

/**
 * Convert Audio to Playable WhatsApp Video
 * @param {Buffer} buffer Video Buffer
 * @param {String} ext File Extension
 */
function toVideo(buffer, ext) {
  return ffmpeg(
    buffer,
    [
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      "-ab",
      "128k",
      "-ar",
      "44100",
      "-crf",
      "32",
      "-preset",
      "slow",
    ],
    ext,
    "mp4"
  );
}

async function getBuffer(url, options = {}) {
  try {
    const res = await axios({
      method: "get",
      url,
      headers: {
        DNT: 1,
        "Upgrade-Insecure-Request": 1,
      },
      ...options,
      responseType: "arraybuffer",
    });
    return res.data;
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

async function FiletypeFromUrl(url) {
  const buffer = await getBuffer(url);
  const out = await fromBuffer(buffer);
  let type;
  if (out) {
    type = out.mime.split("/")[0];
  }
  return { type, buffer };
}
const decodeJid = (jid) => {
  if (!jid) return jid;
  if (/:\d+@/gi.test(jid)) {
    const decode = jidDecode(jid) || {};
    return decode.user && decode.server
      ? `${decode.user}@${decode.server}`
      : jid;
  } else {
    return jid;
  }
};
function extractUrlFromMessage(message) {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const match = urlRegex.exec(message);
  return match ? match[0] : null;
}

module.exports = {   parseTimeToSeconds: (timeString) => {
    const [minutes, seconds] = timeString.split(":").map(Number);
    return minutes * 60 + seconds;
  },
createInteractiveMessage,
  toAudio,
  toPTT,
  toVideo,
  ffmpeg,
  FiletypeFromUrl,
  getBuffer,
  decodeJid,
    isAdmin: async (jid, user, client) => {
    const groupMetadata = await client.groupMetadata(jid);
    const groupAdmins = groupMetadata.participants
      .filter((participant) => participant.admin !== null)
      .map((participant) => participant.id);

    return groupAdmins.includes(decodeJid(user));
  },
   webp2mp4: async (source) => {
    let form = new FormData();
    const isUrl = typeof source === "string" && /https?:\/\//.test(source);
    form.append("new-image-url", isUrl ? source : "");
    form.append("new-image", isUrl ? "" : source, "image.webp");
    let res = await fetch("https://ezgif.com/webp-to-mp4", {
      method: "POST",
      body: form,
    });
    
    let html = await res.text();
    let { document } = new JSDOM(html).window;
    let form2 = new FormData();
    let obj = {};
    for (let input of document.querySelectorAll("form input[name]")) {
      obj[input.name] = input.value;
      form2.append(input.name, input.value);
    }
    let res2 = await fetch("https://ezgif.com/webp-to-mp4/" + obj.file, {
      method: "POST",
      body: form2,
    });
    let html2 = await res2.text();
    let { document: document2 } = new JSDOM(html2).window;
    return new URL(
      document2.querySelector("div#output > p.outfile > video > source").src,
      res2.url
    ).toString();
  },
  validatAndSaveDeleted,
  webp2png: async (source) => {
    let form = new FormData();
    let isUrl = typeof source === "string" && /https?:\/\//.test(source);
    form.append("new-image-url", isUrl ? source : "");
    form.append("new-image", isUrl ? "" : source, "image.webp");
    let res = await fetch("https://s6.ezgif.com/webp-to-png", {
      method: "POST",
      body: form,
    });
    let html = await res.text();
    let { document } = new JSDOM(html).window;
    let form2 = new FormData();
    let obj = {};
    for (let input of document.querySelectorAll("form input[name]")) {
      obj[input.name] = input.value;
      form2.append(input.name, input.value);
    }
    let res2 = await fetch("https://ezgif.com/webp-to-png/" + obj.file, {
      method: "POST",
      body: form2,
    });
    let html2 = await res2.text();
    console.log(html2);
    let { document: document2 } = new JSDOM(html2).window;
    return new URL(
      document2.querySelector("div#output > p.outfile > img").src,
      res2.url
    ).toString();
  },
   parsedJid(text = "") {
    return [...text.matchAll(/([0-9]{5,16}|0)/g)].map(
      (v) => v[1] + "@s.whatsapp.net"
    );
  },
    Bitly: async (url) => {
    return new Promise((resolve, reject) => {
      const BitlyClient = require("bitly").BitlyClient;
      const bitly = new BitlyClient("6e7f70590d87253af9359ed38ef81b1e26af70fd");
      bitly
        .shorten(url)
        .then((a) => {
          resolve(a);
        })
        .catch((A) => reject(A));
      return;
    });
  },
    isNumber: function isNumber() {
    const int = parseInt(this);
    return typeof int === "number" && !isNaN(int);
  },
    isUrl: (isUrl = (url) => {
    return new RegExp(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/,
      "gi"
    ).test(url);
  }),
   getRandom: function getRandom() {
    if (Array.isArray(this) || this instanceof String)
      return this[Math.floor(Math.random() * this.length)];
    return Math.floor(Math.random() * this);
  },
   getUrl: (getUrl = (url) => {
    return url.match(
      new RegExp(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/,
        "gi"
      )
    );
  }),
      secondsToDHMS: (seconds) => {
    seconds = Number(seconds);

    const days = Math.floor(seconds / (3600 * 24));
    seconds %= 3600 * 24;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    seconds = Math.floor(seconds);

    const parts = [];

    if (days) parts.push(`${days} Days`);
    if (hours) parts.push(`${hours} Hours`);
    if (minutes) parts.push(`${minutes} Minutes`);
    if (seconds) parts.push(`${seconds} Seconds`);
    return parts.join(" ");
  },
    qrcode: async (string) => {
    const { toBuffer } = require("qrcode");
    let buff = await toBuffer(string);
    return buff;
  },
     isIgUrl: (url) => {
    /(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am|instagr.com)\/(\w+)/gim.test(
      url
    );
  },
    AddMp3Meta: async (
    songbuffer,
    coverBuffer,
    options = { title: "Mask-md", artist: ["Mask Ser"] }
  ) => {
    if (!Buffer.isBuffer(songbuffer)) {
      songbuffer = await getBuffer(songbuffer);
    }
    if (!Buffer.isBuffer(coverBuffer)) {
      coverBuffer = await getBuffer(coverBuffer);
    }

    const writer = new id3(songbuffer);
    writer
      .setFrame("TIT2", options.title)
      .setFrame("TPE1", ["Mask-md"])
      .setFrame("APIC", {
        type: 3,
        data: coverBuffer,
        description: "Mask Ser",
      });

    writer.addTag();
    return Buffer.from(writer.arrayBuffer);
  },
readQr,
igdl,
validatAndSaveDeleted,
aiImage,
Imgbb
             
 }