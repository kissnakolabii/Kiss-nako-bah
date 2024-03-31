const axios = require('axios');

module.exports.config = {
    name: "gs",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Jonell Magallanes",
    description: "Google Scholar",
    usePrefix: false,
    commandCategory: "Google",
    usages: "query",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
    const content = args.join(" ");

    try {
        const response = await axios.get(`https://jonellccprojectapis.onrender.com/api/gs?q=${content}`);
        const results = response.data.organicResults;

        if (results && results.length > 0) {
            const message = `📖 | GOOGLE SCHOLAR RESULT\n\n${results.map((result, index) => `**${index + 1}.** *${result.title}*\n${result.snippet}\nLink: ${result.link}`).join('\n\n')}\n\nGOOGLE SCHOOL API`;

            api.sendMessage({ body: message }, event.threadID);
        } else {
            api.sendMessage({ body: "No results found." }, event.threadID);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        api.sendMessage({ body: "An error occurred while fetching data." }, event.threadID);
    }
};
