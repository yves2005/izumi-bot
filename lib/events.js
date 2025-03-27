const config = require("../config");
const commands = [];
const HANDLERS = config.HANDLERS == "null" ? '' : config.HANDLERS;
let handler = HANDLERS;

if (!handler.startsWith('^') && handler !== '') {
  handler = handler.replace('[', '').replace(']', '').replace(/\./g, '[.]');
} else if (/\p{Emoji_Presentation}/gu.test(HANDLERS)) {
  handler = "^[.]";
}

config.HANDLERS = handler;

function izumi(commandObj, commandFunction) {
  const messageTypes = ["photo", "image", "text", "sticker", "message","audio","video"];
  const commandConfig = {
    'fromMe': commandObj.fromMe === undefined ? true : commandObj.fromMe,
    'onlyGroup': commandObj.onlyGroup === undefined ? false : commandObj.onlyGroup,
    'desc': commandObj.desc === undefined ? '' : commandObj.desc,
    'dontAddCommandList': commandObj.dontAddCommandList === undefined ? false : commandObj.dontAddCommandList,
    'type': commandObj.type === undefined ? false : commandObj.type,
    'function': commandFunction
  };

  if (commandObj.on === undefined && commandObj.pattern === undefined) {
    commandConfig.on = "message";
    commandConfig.fromMe = false;
  } else if (commandObj.on !== undefined && messageTypes.includes(commandObj.on)) {
    commandConfig.on = commandObj.on;
    if (commandObj.pattern !== undefined) {
      commandConfig.pattern = new RegExp((commandObj.handler === undefined || commandObj.handler === true ? config.HANDLERS : '') + commandObj.pattern, commandObj.flags !== undefined ? commandObj.flags : '');
    }
  } else {
    commandConfig.pattern = new RegExp((handler.startsWith('^') ? handler : '^' + handler) + '(' + commandObj.pattern + "| " + commandObj.pattern + ')', 'is');
  }

  commands.push(commandConfig);
  return commandConfig;
}
module.exports = {
izumi: izumi,
commands: commands,
PREFIX: (config.HANDLERS ? config.HANDLERS.startsWith("^") ? config.HANDLERS.match(/\[(\W*)\]/)?.[1]?.[0] : config.HANDLERS.replace(/\[/g, "").replace(/\]/g, "") : "").trim() || config.HANDLERS,
mode: config.MODE == 'public' ? false : true
}