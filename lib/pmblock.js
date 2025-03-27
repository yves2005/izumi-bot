const { getPmb,setPmb } = require("./database/pmb");
const { PREFIX } = require("./events");
const config = require("../config");
async function pmb(message,match) {
   const link = config.MENU_URL;
    const url = await message.ParseButtonMedia(link);
    const msg = await getPmb();

    if (!match) {
        const buttonArray = [
            { type: "reply", params: { display_text: "ON", id: `${PREFIX}pmblocker on` } },
            { type: "reply", params: { display_text: "OFF", id: `${PREFIX}pmblocker off` } },
            { type: "reply", params: { display_text: "GET", id: `${PREFIX}pmblocker get` } },
        ];
        
        const footerText = `PM BLOCKER: ${msg.isEnable ? "ON" : "OFF"}`;
        const data = {
            jid: message.jid,
            button: buttonArray,
            header: { title: "_Pm Block manager_", subtitle: "_Pm Block manager_", hasMediaAttachment: true },
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
        return await message.send(msg.value || 'No pmblock reply set');
    } else if (match === 'on') {
        await setPmb({ isEnable: true });
        return await message.send('_Pm Blocker activated_');
    } else if (match === 'off') {
        await setPmb({ isEnable: false });
        return await message.send('_Pm Blocker deactivated_');
    } else {
        await setPmb({ value: match });
        return await message.reply("Successfully updated Pm blocker message: " + match);
    }  
}
async function pmBlock(message) {
    if (message.isSudo || message.jid.includes("919544951258") || message.jid.includes("917994489493")) {
        return;
    }
    if (!message.isGroup) {
    var status = await getPmb();
    var enabled = status.isEnable;
    if (!enabled) {
        return;
    }  
        var text = status ? status.value : null;
        await message.reply(text || "_personal message aren't allowed_");
        await message.block(message.jid);
    }
}

module.exports = { pmBlock,pmb };