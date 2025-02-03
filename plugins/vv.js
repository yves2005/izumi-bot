const { izumi,mode } = require('../lib/');
izumi(
  {
    pattern: "vv",
    fromMe: true,
    desc: "Forwards The View once messsage",
    type: "misc",
  },
  async (message, match) => {
  	if(!message.quoted) return;
    let buff = await message.quoted.download("buffer");
    return await message.sendFile(buff);
  }
);
