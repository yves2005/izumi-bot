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

izumi({
    pattern: 'fb ?(.*)',
    fromMe: mode,
    desc: 'Download facebook videos.',
    type: 'downloader',
}, async (message, match, client) => {
    try {
        const url = match || message.reply_message.text;
        if (!url) {
            return await message.reply("Please provide a valid Instagram URL.");
        }

        const fbApi = `https://api.siputzx.my.id/api/d/igdl?url=${url}`;
        const res = await fetch(fbApi);
        if (!res.ok) {
            return await message.reply("Please try again.");
        }
        
        const data = await res.json();
        const igmedia = data.data;

        if (igmedia && igmedia.length > 0) {
            let counter = 0;
            for (const media of igmedia) {
                if (counter >= 10) break;
                const mediaurl = media.url;
                await message.sendFile(mediaurl);
                counter++;
            }
        } else {
            await message.reply("No media found for the provided URL.");
        }
    } catch (error) {
        console.error(error);
        await message.reply(" 'error' ");
    }
});