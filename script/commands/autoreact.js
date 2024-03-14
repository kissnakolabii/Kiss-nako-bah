const axios = require('axios');

module.exports.config = {
  name: "autoreact",
  version: "1.0",
  hasPermssion: 0,
  credits: "Jonell Magallanes",
  description: "Auto react based on the context of users",
  usePrefix: false,
  commandCategory: "No Prefix",
  usage: " ",
  cooldowns: 3,
};

module.exports.handleEvent = async function ({ api, event }) {
  if (event.body !== null && event.isGroup) {
    axios.get(`https://jonellccapisproject-e1a0d0d91186.herokuapp.com/api/text?emoji=${encodeURIComponent(event.body)}`)
      .then(response => {
        const emoji = response.data.response;
        api.setMessageReaction(emoji, event.messageID, () => { }, true);
      })
      .catch(error => {
        console.error('Error fetching auto reaction:', error);
      });
  }
};

module.exports.run = async function ({ api, event }) {
  api.sendMessage("📝 | This command automatically reacts to each message from users.", event.threadID);
};
