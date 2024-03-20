const axios = require('axios');
const fs = require('fs');

module.exports.config = {
    name: "artist",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Jonell Magallanes",
    description: "Artist AI developed by Jonell Magallanes",
    usePrefix: false,
    commandCategory: "Arts",
    usages: "[question]",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
    const content = encodeURIComponent(args.join(" "));
    const apiUrl = `https://artistai-e2000fe7437b.herokuapp.com/artist?query=${content}`;
    const imageApiUrl = `https://aemt.me/ai/text2img?text=${content}`;

    if (!content) return api.sendMessage("Hello there! I'm AI Artist here to guide you with your drawing and ideas!\n\nUsage: artist how to draw tree?", event.threadID, event.messageID);

    try {
        api.sendMessage("🎨 | AI ARTIST Searching for your answer. Please wait...", event.threadID, async (error, info) => {
            if (error) return console.error(error);

            try {
                const response = await axios.get(apiUrl);
                const { prompt, instructions } = response.data;

                api.sendMessage(prompt, event.threadID);

                const imageResponse = await axios.get(imageApiUrl, { responseType: 'arraybuffer' });
                const imageData = Buffer.from(imageResponse.data, 'binary');
                const imagePath = `./${event.messageID}.jpg`;

                fs.writeFileSync(imagePath, imageData);

                api.sendMessage({
                    body: `🎨 | Here's your image idea along with the drawing:`,
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID);
            } catch (error) {
                console.error(error);
                api.sendMessage("An error occurred while processing your request.", event.threadID);
            }
        });
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", event.threadID);
    }
};
