// Set the ephemeral expiration time (1 day in seconds)
//const ephemeralExpiration = 86400;

// Destructure required modules and functions
const { WAProto, generateWAMessageFromContent, prepareWAMessageMedia } = require('@adiwajshing/baileys');
const { genThumbnail, extractVideoThumb } = require('./constant');

// Global object to store messages
global.messages = {};

// Function to prepare a message
exports.prepareMessage = async (jid, message, options, type, upload) => {
    // Set ephemeral expiration for the message
//    options.ephemeralExpiration = ephemeralExpiration;

    let preparedMessage, messageContent;

    switch (type) {
        case 'button': {
            let buttonMessage = WAProto.ButtonsMessage.fromObject(message.button);
            messageContent = WAProto.Message.fromObject({ buttonsMessage: buttonMessage });
            break;
        }
        case 'template': {
            let templateMessage = WAProto.TemplateMessage.fromObject(message.template);
            messageContent = WAProto.Message.fromObject({ templateMessage });
            break;
        }
        case 'text': {
            let extendedText = message;
            messageContent = WAProto.Message.fromObject({ extendedTextMessage: extendedText });
            break;
        }
        case 'list': {
            let listMessage = WAProto.ListMessage.fromObject(message.list);
            messageContent = WAProto.Message.fromObject({ listMessage });
            break;
        }
        default: {
            if ('image' in message) {
                message.jpegThumbnail = await genThumbnail(message.image);
            } else if ('video' in message) {
                const { thumbnail, duration } = await extractVideoThumb(message.video);
                message.jpegThumbnail = thumbnail;
                message.seconds = duration;
            }
            options.upload = upload.waUploadToServer;
            messageContent = await prepareWAMessageMedia(message, options);
            break;
        }
    }

    const [messageType] = Object.keys(messageContent);
    if (!messageContent[messageType].contextInfo) {
        messageContent[messageType].contextInfo = options.contextInfo || {};
    }

    preparedMessage = generateWAMessageFromContent(jid, messageContent, options);
    global.messages[preparedMessage.key.id] = preparedMessage;

    await upload.relayMessage(jid, preparedMessage.message, {
        messageId: preparedMessage.key.id,
        additionalAttributes: {}
    }).catch(error => {
        console.log(error);
    });
};