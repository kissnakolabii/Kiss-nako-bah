const axios = require('axios');

module.exports.config = {
    name: "llma",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Jonell Magallanes",
    description: "EDUCATIONAL",
    usePrefix: false,
    commandCategory: "EDUCATIONAL",
    usages: "[question]",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
    const ask = encodeURIComponent(args.join(" "));
    const apiUrl = `https://jonellccapisproject-e1a0d0d91186.herokuapp.com/api/cl?ques=${ask}`;
    
    if (!ask) return api.sendMessage("Please provide your question.\n\nExample: llma what is the solar system?", event.threadID, event.messageID);

    try {
        api.sendMessage("🔍 | LLAMA AI is searching for your answer. Please wait...", event.threadID, event.messageID);

        const response = await axios.get(apiUrl);
        const reply = response.data.message;

        api.sendMessage(`𝙲𝙾𝙳𝙴 𝙻𝙻𝙼𝙰\n\n${reply}`, event.threadID, event.messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", event.threadID);
    }
};
