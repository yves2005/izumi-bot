const { izumi, mode, getJson } = require("../lib");
const config = require("../config");
izumi({
  pattern: "waifu",
  fromMe: mode,
  desc: "Random anime images",
  type: "Anime",
}, async (message, match) => {
  var { url } = await getJson('https://api.waifu.pics/sfw/waifu');
  await message.sendFromUrl(url,{caption: `${config.CAPTION}`});
});
izumi({
  pattern: "neko",
  fromMe: mode,
  desc: "Random anime images",
  type: "Anime",
}, async (message, match) => {
  var { url } = await getJson('https://api.waifu.pics/sfw/neko');
  await message.sendFromUrl(url,{caption: `${config.CAPTION}`});
});
izumi({
  pattern: "loli",
  fromMe: mode,
  desc: "Random anime images",
  type: "Anime",
}, async (message, match) => {
  var { url } = await getJson('https://api.waifu.pics/sfw/neko');
  await message.sendFromUrl(url,{caption: `${config.CAPTION}`});
});
