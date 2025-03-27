const { PREFIX, mode, commands } = require("./events");
const version = require("../package.json").version;
const { getJson } = require("./utils");
const config = require("../config");
const { getMenu, setMenu } = require("./database/menu");

async function sendMenu(message, match) {
    if (match) {
        for (let i of commands) {
            if (i.pattern instanceof RegExp && i.pattern.test(`${PREFIX}` + match)) {
                const cmdName = i.pattern.toString().split(/\W+/)[1];
                message.reply(`\`\`\`🤖Command: ${PREFIX}${cmdName.trim()}\nDescription: ${i.desc}\`\`\``);
            }
        }
    } else {
        const link = config.MENU_URL;
        const hrs = new Date().getHours({ timeZone: 'Asia/Kolkata' });
        const { result } = await getJson("https://api.maskser.me/api/quote?apikey=izumi-v3");
        const type = mode ? "𝗣𝗥𝗜𝗩𝗔𝗧𝗘" : "𝗣𝗨𝗕𝗟𝗜𝗖";
        var msg = await getMenu();

        let wish = '';
        if (hrs < 12) wish = '⛅𝙂𝙤𝙤𝙙 𝙈𝙤𝙧𝙣𝙞𝙣𝙜 ';
        else if (hrs >= 12 && hrs <= 16) wish = '🌞𝙂𝙤𝙤𝙙 𝘼𝙛𝙩𝙚𝙧𝙣𝙤𝙤𝙣';
        else if (hrs >= 16 && hrs <= 20) wish = '🔆𝙂𝙤𝙤𝙙 𝙀𝙫𝙚𝙣𝙞𝙣𝙜';
        else if (hrs >= 20 && hrs <= 24) wish = '🌙𝙂𝙤𝙤𝙙 𝙉𝙞𝙜𝙝𝙩';

        if (msg.value === "button") {
            const url = await message.ParseButtonMedia(link);
            let buttonArray = [
                { type: "reply", params: { display_text: "DOWNLOADER", id: `${PREFIX}.downloader` } },
                { type: "reply", params: { display_text: "INFO", id: `${PREFIX}.info` } },
                { type: "reply", params: { display_text: "GROUP", id: `${PREFIX}.group` } },
                { type: "reply", params: { display_text: "MEDIA", id: `${PREFIX}.media` } },
                { type: "reply", params: { display_text: "AnimeVideo", id: `${PREFIX}.AnimeVideo` } },
                { type: "reply", params: { display_text: "USER", id: `${PREFIX}.user` } },
                { type: "reply", params: { display_text: "GENERATOR", id: `${PREFIX}.generator` } },
                { type: "reply", params: { display_text: "AnimeImage", id: `${PREFIX}.AnimeImage` } },
            ];

            const taxt = `╭────────────────╮
*_🌻ǫᴜᴏᴛᴇ ᴏғ ᴛʜᴇ ᴅᴀʏ 🌻_*
╰────────────────╯
📖 *${result.quoteText}* 🖋️
\n${wish} ${message.pushName.replace(/[\r\n]+/gm, "")}`;

            buttonArray.sort((a, b) => a.params.display_text.localeCompare(b.params.display_text));

            let data = {
                jid: message.jid,
                button: buttonArray,
                header: {
                    title: taxt,
                    subtitle: taxt,
                    hasMediaAttachment: true,
                },
                footer: {
                    text: `𝗠𝗢𝗗𝗘 : ${type}\n𝗩𝗘𝗥𝗦𝗜𝗢𝗡 : ${version}\n${config.BOT_NAME}`,
                },
                body: {
                    text: "",
                },
            };

            if (link.endsWith(".mp4")) {
                data.header.videoMessage = url;
            } else {
                data.header.imageMessage = url;
            }

            return await message.sendMessage(message.jid, data, {}, "interactive");
        } else if (msg.value === "list") {
            const url = await message.ParseButtonMedia(link);
            let sections = [
                {
                    title: "Izumi Commands",
                    rows: [
                        { title: "DOWNLOADER", id: `${PREFIX}.downloader` },
                        { title: "INFO", id: `${PREFIX}.info` },
                        { title: "GROUP", id: `${PREFIX}.group` },
                        { title: "MEDIA", id: `${PREFIX}.media` },
                        { title: "AnimeVideo", id: `${PREFIX}.AnimeVideo` },
                        { title: "USER", id: `${PREFIX}.user` },
                        { title: "GENERATOR", id: `${PREFIX}.generator` },
                        { title: "AnimeImage", id: `${PREFIX}.AnimeImage` },
                    ],
                },
            ];

            const taxt = `╭────────────────╮
*_🌻ǫᴜᴏᴛᴇ ᴏғ ᴛʜᴇ ᴅᴀʏ 🌻_*
╰────────────────╯
📖 *${result.quoteText}* 🖋️
\n${wish} ${message.pushName.replace(/[\r\n]+/gm, "")}`;

            let data = {
                jid: message.jid,
                button: [
                    {
                        type: "list",
                        params: {
                            title: "Izumi Menu",
                            sections: sections,
                        },
                    },
                ],
                header: {
                    title: taxt,
                    subtitle: taxt,
                    hasMediaAttachment: true,
                },
                footer: {
                    text: `𝗠𝗢𝗗𝗘 : ${type}\n𝗩𝗘𝗥𝗦𝗜𝗢𝗡 : ${version}\n${config.BOT_NAME}`,
                },
                body: {
                    text: "",
                },
            };

            if (link.endsWith(".mp4")) {
                data.header.videoMessage = url;
            } else {
                data.header.imageMessage = url;
            }

            return await message.sendMessage(message.jid, data, {}, "interactive");
        } else if (msg.value === "text") {
            const readMore = String.fromCharCode(8206).repeat(4001);
            let menu = `\n╭━━━〔 ${config.BOT_NAME} 〕━━━┈
            ╭──────────────
            ❖ │  *OWNER*: ${config.OWNER_NAME}
            ❖ │  *COMMANDS*: ${commands.filter((command) => command.pattern).length}
            ❖ │  *MODE*: ${mode ? '𝗣𝗥𝗜𝗩𝗔𝗧𝗘' : '𝗣𝗨𝗕𝗟𝗜𝗖'}
            ❖ │  *PREFIX*: ${PREFIX}
            ❖ │  *VERSION*: ${version}
            ╰──────────────
            ╰━━━━━━━━━━━━━━━┈\n ${readMore}`;

            let cmnd = [];
            let cmd;
            let category = [];
            commands.forEach((command, num) => {
                if (command.pattern instanceof RegExp) {
                    cmd = String(command.pattern).split(/\W+/)[1];
                }

                if (!command.dontAddCommandList && command.pattern) {
                    let type = command.type ? command.type.toLowerCase() : "misc";

                    cmnd.push({ cmd, type });

                    if (!category.includes(type)) category.push(type);
                }
            });
            cmnd.sort();
            category.sort().forEach((cmmd) => {
                menu += `\n ╭─────────────────────┈⚆`;
                menu += `\n  │ 「 *${cmmd.toUpperCase()}* 」`;
                menu += `\n ╰┬────────────────────┈⚆`;
                menu += `\n ╭┴────────────────────┈⚆`;
                let comad = cmnd.filter(({ type }) => type == cmmd);
                comad.forEach(({ cmd }) => {
                    menu += `\n❆  ${cmd.trim()}`;
                });
                menu += `\n ╰─────────────────────┈⚆`;
            });
            menu += `\n\n${config.BOT_NAME}`;
            let mediaUrl = config.MENU_URL;
            return await message.sendFromUrl(mediaUrl, { fileLength: "5555544444", gifPlayback: true, caption: menu }, { quoted: message });
        }
    }
}

async function sendSegMenu(message, match, type) {
    let msg = ' *HERE ARE THE AVAILABLE COMMANDS:* \n\n';
    let no = 1;

    commands.map((command) => {
        if (command.type === type && !command.dontAddCommandList && command.pattern) {
            const commandName = command.pattern.toString().match(/(\W*)([A-Za-z0-9_ğüşiö ç]*)/)[2].trim();
            msg += `╭─────────────┈⚆\n`;
            msg += `│  *${no++}. ${commandName}*\n`;
            msg += `│─╖\n`;
            msg += `│ ${command.desc}\n`;
            msg += `╰─────────────┈⚆\n\n`;
        }
    });

    await message.reply(msg.trim());
}

async function setMenuType(message, match) {
    const link = config.MENU_URL;
    const url = await message.ParseButtonMedia(link);
    const menuType = await getMenu();
    const menutyp = menuType.value;
    const menuvalue = menutyp === 'text' ? 'v1' : menutyp === 'button' ? 'v2' : 'v3';

    if (!match) {
        const buttonArray = [
            { type: "reply", params: { display_text: "V1", id: `${PREFIX}setmenu v1` } },
            { type: "reply", params: { display_text: "V2", id: `${PREFIX}setmenu v2` } },
            { type: "reply", params: { display_text: "V3", id: `${PREFIX}setmenu v3` } },
        ];

        const footerText = `MENU TYPE: ${menuvalue}`;
        const data = {
            jid: message.jid,
            button: buttonArray,
            header: { title: "*Izumi-v3 Menu Control panel*", subtitle: "_Izumi-v3 Menu Control panel_", hasMediaAttachment: true },
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

    if (match === 'v1') {
        await setMenu({ value: "text" });
        return await message.send('> Menu type changed to v1');
    } else if (match === 'v2') {
        await setMenu({ value: "button" });
        return await message.send('> Menu type changed to v2');
    } else if (match === 'v3') {
        await setMenu({ value: "list" });
        return await message.send('> Menu type changed to v3');
    }
}

module.exports = { sendMenu, sendSegMenu, setMenuType };
        
