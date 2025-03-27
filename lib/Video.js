const Base = require("./Base");
const Message = require("./Message");
const ReplyMessage = require("./ReplyMessage");
class Video extends Base {
  constructor(client, data) {
    super(client);
    if (data) {
      this._patch(data);
    }
  }
  _patch(data) {
    this.id = data.key.id === undefined ? undefined : data.key.id;
    this.jid = data.key.remoteJid;
    this.botNumber = this.client.user.id.split(':')[0] + "@s.whatsapp.net";
    this.fromMe = data.key.fromMe;
    this.caption = data.message.videoMessage.caption === null ? data.message.videoMessage.caption : '';
    this.url = data.message.videoMessage.url;
    this.timestamp = typeof data.messageTimestamp === "object" ? data.messageTimestamp.low : data.messageTimestamp;
    this.mimetype = data.message.videoMessage.mimetype;
    this.height = data.message.videoMessage.height;
    this.width = data.message.videoMessage.width;
    this.mediaKey = data.message.videoMessage.mediaKey;
    this.data = data;
    if (data.message.videoMessage.hasOwnProperty("contextInfo") && data.message.videoMessage.contextInfo.quotedMessage) {
      this.reply_message = new ReplyMessage(this.client, data.message.videoMessage.contextInfo);
    } else {
      this.reply_message = false;
    }
    return super._patch(data);
  }
  async delete() {
    return await this.client.deleteMessage(this.jid, {
      'id': this.id,
      'remoteJid': this.jid,
      'fromMe': true
    });
  }
  async reply(text) {
    var message = await this.client.sendMessage(this.jid, {
      'text': text
    }, {
      'quoted': this.data
    });
    return new Message(this.client, message);
  }
  async sendMessage(text, options, additionalOptions) {
    return await this.client.sendMessage(this.jid, text, options, additionalOptions);
  }
  async sendTyping() {
    return await this.client.updatePresence(this.jid, Presence.composing);
  }
  async sendRead() {
    return await this.client.chatRead(this.jid);
  }
  async download(filename = this.id) {
    await this.client.downloadAndSaveMediaMessage(this.data, filename);
    return this.id + '.' + this.mimetype.split('/')[1];
  }
}
module.exports = Video;
