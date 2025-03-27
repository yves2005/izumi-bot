const { extractMediaUrl, extractVideoUrl } = require("./utils");
const { getBuffer, toPTT, getRandom } = require("./functions");
const { PREFIX } = require("./events");
const config = require("../config");
const { SUDO } = require("../config");
const { setMention, getMention } = require("./database/mention");

async function sendMenButton(message, match) {
    const link = config.MENU_URL;
    const url = await message.ParseButtonMedia(link);
    const msg = await getMention();

    if (!match) {
        const buttonArray = [
            { type: "reply", params: { display_text: "ON", id: `${PREFIX}mention on` } },
            { type: "reply", params: { display_text: "OFF", id: `${PREFIX}mention off` } },
            { type: "reply", params: { display_text: "GET", id: `${PREFIX}mention get` } },
        ];

        const footerText = `MENTION: ${msg.isEnable ? "ON" : "OFF"}`;
        const data = {
            jid: message.jid,
            button: buttonArray,
            header: { title: "_Mention message manager_", subtitle: "_Mention message manager_", hasMediaAttachment: true },
            footer: { text: footerText },
            body: { text: "" },
        };

        if (link.endsWith(".mp4")) {
            data.header.videoMessage = url;
        } else {
            data.header.imageMessage = url;
        }

        return await message.sendMessage(message.jid, data, {}, "interactive");
    }

    if (match === "get") {
        return await message.send(msg.value || 'No mention message set');
    } else if (match === 'on') {
        await setMention({ isEnable: true });
        return await message.send('_mention message activated_');
    } else if (match === 'off') {
        await setMention({ isEnable: false });
        return await message.send('_mention message deactivated_');
    } else {
        await setMention({ value: match });
        return await message.reply("Successfully updated mention to: " + match);
    }
}

async function sendMention(message, match) {
    let men;
    try {
        men = message.mention && message.mention[0] ? message.mention[0].split('@')[0] : null;
    } catch (error) {
        return;
    }

    if (!men) {
        return;
    }

    const menMsg = await getMention();
    const text = menMsg.value;
    const enabled = menMsg.isEnable;
    if (!enabled) {
        return;
    }

    const types = ["type/image", "type/video", "type/audio", "type/sticker", "type/gif"];
    const jsonObjects = text.match(/{.*}/g);
    let textContent = text.replace(jsonObjects, '').trim();
    let options = { contextInfo: {} };

    let mediaType = "text";

    for (const type of types) {
        if (text.includes(type)) {
            mediaType = type.replace("type/", '');
            textContent = textContent.replace(type, '').trim();
            break;
        }
    }

    if (jsonObjects) {
        try {
            const sanitizedJson = jsonObjects[0]
                .replace(/[\n\r]/g, '')
                .replace(/'/g, '"')
                .replace(/`/g, '"')
                .replace(/,\s*}/g, '}')
                .replace(/,\s*]/g, ']')
                .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

            options = { ...options, ...JSON.parse(sanitizedJson) };
        } catch (e) {}
    }

    if (options.linkPreview) {
        options.contextInfo = options.contextInfo ? options.contextInfo : {};
        options.contextInfo.externalAdReply = options.linkPreview;
    }
    if (options.contextInfo?.externalAdReply?.thumbnail) {
        options.contextInfo.externalAdReply.thumbnailUrl = options.contextInfo.externalAdReply.thumbnail;
        delete options.contextInfo.externalAdReply.thumbnail;
    }
    delete options.linkPreview;

    const mediaUrls = await extractMediaUrl(textContent);
    const videoUrls = await extractVideoUrl(textContent);

    if (message.mention.includes(message.user) || SUDO.includes(men)) {
        if ((mediaType === 'image' || mediaType === 'video' || mediaType === 'audio') && mediaUrls.length > 0) {
            try {
                const mediaUrl = getRandom(mediaUrls);
                const videoUrl = getRandom(videoUrls);
                console.log(`Attempting to send ${mediaType}:`, mediaUrl);

                if (mediaType === 'image') {
                    await message.sendFromUrl(mediaUrl, options);
                } else if (mediaType === 'video') {
                    await message.sendFromUrl(mediaUrl, options);
                } else if (mediaType === 'audio') {
                    const buff = await getBuffer(videoUrl);
                    const audio = await toPTT(buff, "opus");
                    await message.client.sendMessage(message.jid, { audio: audio, ...options }, { quoted: message.data });
                }
            } catch (error) {
                await message.reply(options.caption || textContent);
                console.log(error);
            }
        } else {
            await message.reply(options.caption || textContent);
        }
    }
}

module.exports = { sendMenButton, sendMention };