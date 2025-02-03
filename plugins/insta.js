const { izumi, mode } = require("../lib");
const fetch = require("node-fetch");

izumi({
    pattern: 'insta ?(.*)',
    fromMe: mode,
    desc: 'Download Instagram reels',
    type: 'downloader'
}, async (message, match, client) => {
    if (!match[1]) {
        return await message.reply('Please provide an Instagram reel URL!');
    }

    const api = `https://api-25ca.onrender.com/api/instagram?url=${match}`;
    try {
        const response = await fetch(api);
        const data = await response.json();
        const dl = data.result;

        if (!dl) {
            return await message.reply('Failed to download the video. Please check the URL or try again later.');
        }

        await client.sendMessage(message.jid, {
            video: { url: dl },
            caption: "Here is your video",
            mimetype: "video/mp4",
        }, { quoted: message.data });
    } catch (error) {
        await message.reply('An error occurred while processing your request.');
        console.error(error);
    }
});
