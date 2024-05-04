module.exports.config = {
  name: "shoti",
  version: "1.0.0",
  hasPermission: 0,
  credits: "𝐌𝐀𝐑𝐉𝐇𝐔𝐍 𝐁𝐀𝐘𝐋𝐎𝐍",
  description: "𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙴 𝚁𝙰𝙽𝙳𝙾𝙼 𝙷𝙾𝚃 𝚂𝙷𝙾𝚃𝙸 𝙾𝙽 𝚃𝙸𝙺𝚃𝙾𝙺.",
  commandCategory: "Entertainment",
  usage: "[]",
  cooldowns: 10s,
  usePrefix: false,
  dependencies: {}
};

module.exports.run = async ({ api, event, args }) => {

  api.setMessageReaction("⏳", event.messageID, (err) => {
     }, true);
  api.sendTypingIndicator(event.threadID, true);

  const { messageID, threadID } = event;
  const fs = require("fs");
  const axios = require("axios");
  const request = require("request");
  const prompt = args.join(" ");

  if (!prompt[0]) { 
    api.sendMessage("𝖦𝖤𝖭𝖤𝖱𝖠𝖳𝖨𝖭𝖦 𝖳𝖧𝖤 𝖵𝖨𝖣𝖤𝖮", threadID, messageID);
  }

  try {
    const response = await axios.post(`https://shoti-server-v2.vercel.app/api/v1/get`, { apikey: `$shoti-1hspogmb134oom5k7f` });

    const path = __dirname + `/cache/shoti/shoti.mp4`;
    const file = fs.createWriteStream(path);
    const rqs = request(encodeURI(response.data.data.url));
    rqs.pipe(file);
    file.on(`finish`, () => {
      api.setMessageReaction("✅", event.messageID, (err) => {
        }, true);
      return api.sendMessage({
        body: `@${response.data.data.user.username}\n\n\n 𝙽𝙸𝙲𝙺𝙽𝙰𝙼𝙴 ${response.data.data.user.nickname}\n𝙳𝚄𝚁𝙰𝚃𝙸𝙾𝙽 : ${response.data.data.duration}`, 
        attachment: fs.createReadStream(path)
      }, threadID);
    });
    file.on(`error`, (err) => {
      api.sendMessage(`Error: ${err}`, threadID, messageID);
    });
  } catch (err) {
    api.sendMessage(`Error: ${err}`, threadID, messageID);
  }
};
