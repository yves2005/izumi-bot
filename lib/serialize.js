const { downloadContentFromMessage, getContentType } = require("@adiwajshing/baileys");
const fs = require("fs").promises;
const { writeExifImg, writeExifVid, imageToWebp, videoToWebp } = require("./sticker");

async function downloadMedia(message, pathFile) {
  const mimeMap = {
    imageMessage: "image",
    videoMessage: "video",
    stickerMessage: "sticker",
    documentMessage: "document",
    audioMessage: "audio",
  };

  try {
    let type = Object.keys(message)[0];
    let mes = message;

    if (type === "templateMessage") {
      mes = message.templateMessage.hydratedFourRowTemplate;
      type = Object.keys(mes)[0];
    }

    if (type === "interactiveResponseMessage") {
      mes = message.interactiveResponseMessage;
      type = Object.keys(mes)[0];
    }

    if (type === "buttonsMessage") {
      mes = message.buttonsMessage;
      type = Object.keys(mes)[0];
    }

    const stream = await downloadContentFromMessage(mes[type], mimeMap[type]);
    const buffer = [];

    for await (const chunk of stream) {
      buffer.push(chunk);
    }

    if (pathFile) {
      await fs.writeFile(pathFile, Buffer.concat(buffer));
      return pathFile;
    } else {
      return Buffer.concat(buffer);
    }
  } catch (error) {
    console.error("Error in downloadMedia:", error);
    throw error;
  }
}

async function serialize(msg, client) {
  client.logger = { info() { }, error() { }, warn() { } };
  if (msg.key) {
    msg.id = msg.key.id;
    msg.isSelf = msg.key.fromMe;
    msg.from = msg.key.remoteJid;
    msg.isGroup = msg.from.endsWith("@g.us");
    msg.sender = msg.isGroup
      ? msg.key.participant
      : msg.isSelf
        ? client.user.id
        : msg.from;
  }

  if (msg.message) {
    msg.type = getContentType(msg.message);

    try {
      msg.mentions = msg.message[msg.type]?.contextInfo?.mentionedJid || [];
    } catch {
      msg.mentions = false;
    }

    try {
      const quoted = msg.message[msg.type]?.contextInfo;
      if (quoted && quoted.quotedMessage) {
        if (quoted.quotedMessage["ephemeralMessage"]) {
          type = Object.keys(quoted.quotedMessage.ephemeralMessage.message)[0];
          msg.quoted = {
            type: type === "viewOnceMessageV2" ? "view_once" : "ephemeral",
            stanzaId: quoted.stanzaId,
            sender: quoted.participant,
            message:
              type === "viewOnceMessageV2"
                ? quoted.quotedMessage.ephemeralMessage.message.viewOnceMessageV2
                  .message
                : quoted.quotedMessage.ephemeralMessage.message,
          };
        } else if (quoted.quotedMessage["viewOnceMessageV2"]) {
          msg.quoted = {
            type: "view_once",
            stanzaId: quoted.stanzaId,
            sender: quoted.participant,
            message: quoted.quotedMessage.viewOnceMessageV2.message,
          };
        } else if (quoted.quotedMessage["viewOnceMessageV2Extension"]) {
          msg.quoted = {
            type: "view_once_audio",
            stanzaId: quoted.stanzaId,
            sender: quoted.participant,
            message: quoted.quotedMessage.viewOnceMessageV2Extension.message,
          };
        } else {
          msg.quoted = {
            type: "normal",
            stanzaId: quoted.stanzaId,
            sender: quoted.participant,
            message: quoted.quotedMessage,
          };
        }

        msg.quoted.isSelf = msg.quoted.sender === client.user.id;
        msg.quoted.mtype = Object.keys(msg.quoted.message);

        msg.quoted.text =
          msg.quoted.message[msg.quoted.mtype]?.text ||
          msg.quoted.message[msg.quoted.mtype]?.description ||
          msg.quoted.message[msg.quoted.mtype]?.caption ||
          (msg.quoted.mtype === "templateButtonReplyMessage" &&
            msg.quoted.message[msg.quoted.mtype].hydratedTemplate
              ?.hydratedContentText) ||
          msg.quoted.message[msg.quoted.mtype] ||
          "";
        msg.quoted.key = {
          id: msg.quoted.stanzaId,
          fromMe: msg.quoted.isSelf,
          remoteJid: msg.from,
        };
        msg.quoted.download = (pathFile) =>
          downloadMedia(msg.quoted.message, pathFile);
      }
    } catch (error) {
      console.error("Error in processing quoted message:", error);
      msg.quoted = null;
    }

    try {
      msg.body =
        msg.message.conversation ||
        msg.message[msg.type]?.text ||
        msg.message[msg.type]?.caption ||
        (msg.type === "listResponseMessage" &&
          msg.message[msg.type].singleSelectReply.selectedRowId) ||
        (msg.type === "buttonsResponseMessage" &&
          msg.message[msg.type].selectedButtonId &&
          msg.message[msg.type].selectedButtonId) ||
        (msg.type === "templateButtonReplyMessage" &&
          msg.message[msg.type].selectedId) ||
        (msg.type === "interactiveResponseMessage" &&
          JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id) ||
        false;
    } catch (error) {
      console.error("Error in extracting message body:", error);
      msg.body = false;
    }
    
    msg.download = (pathFile) => downloadMedia(msg.message, pathFile);

    // Define sendImageAsSticker and sendVideoAsSticker functions
    client.sendImageAsSticker = async (jid, buff, options = {}) => {
      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifImg(buff, options);
      } else {
        buffer = await imageToWebp(buff);
      }
      await client.sendMessage(
        jid,
        { sticker: { url: buffer }, ...options },
        options
      );
    };

    client.sendVideoAsSticker = async (jid, buff, options = {}) => {
      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifVid(buff, options);
      } else {
        buffer = await videoToWebp(buff);
      }
      await client.sendMessage(
        jid,
        { sticker: { url: buffer }, ...options },
        options
      );
    };
  }
  return msg;
}

module.exports = { serialize, downloadMedia };
