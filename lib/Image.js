const Base = require("./Base");
const Message = require("./Message");
const ReplyMessage = require("./ReplyMessage");

class Image extends Base {
  constructor(whatsappClient, message) {
    super(whatsappClient);
    if (message) {
      this._patch(message);
    }
  }

  _patch(message) {
    this.id = message.key.id === undefined ? undefined : message.key.id;
    this.jid = message.key.remoteJid;
    this.fromMe = message.key.fromMe;
    this.caption = message.message.imageMessage.caption === null ? message.message.imageMessage.caption : '';
    this.url = message.message.imageMessage.url;
    this.timestamp = typeof message.messageTimestamp === "object" ? message.messageTimestamp.low : message.messageTimestamp;
    this.mimetype = message.message.imageMessage.mimetype;
    this.height = message.message.imageMessage.height;
    this.width = message.message.imageMessage.width;
    this.mediaKey = message.message.imageMessage.mediaKey;
    this.data = message;

    if (message.message.imageMessage.hasOwnProperty("contextInfo") && message.message.imageMessage.contextInfo.quotedMessage) {
      this.reply_message = new ReplyMessage(this.client, message.message.imageMessage.contextInfo);
    } else {
      this.reply_message = false;
    }
    
    return super._patch(message);
  }

  async delete() {
    return await this.client.deleteMessage(this.jid, {
      'id': this.id,
      'remoteJid': this.jid,
      'fromMe': true
    });
  }

  async reply(message) {
    var sentMessage = await this.client.sendMessage(this.jid, {
      'text': message
    }, {
      'quoted': this.data
    });
    return new Message(this.client, sentMessage);
  }

  async sendMessage(message, options, metadata) {
    return await this.client.sendMessage(this.jid, message, options, metadata);
  }

  async sendTyping() {
    return await this.client.updatePresence(this.jid, Presence.composing);
  }

  async sendRead() {
    return await this.client.chatRead(this.jid);
  }

  async download(fileName = this.id) {
    await this.client.downloadAndSaveMediaMessage(this.data, fileName);
    return this.id + '.' + this.mimetype.split('/')[1];
  }
}

module.exports = Image;
