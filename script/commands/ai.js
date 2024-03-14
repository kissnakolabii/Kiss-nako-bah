const axios = require('axios');
const fs = require('fs').promises;

const storageFile = 'user_data.json';
const chatRecordFile = 'chat_records.json';
const axiosStatusFile = 'axios_status.json';

const primaryApiUrl = 'https://jonellccapisproject-e1a0d0d91186.herokuapp.com/api/gpt';
const secondaryApiUrl = 'https://jonellccapisproject-e1a0d0d91186.herokuapp.com/api/chatgpt';

let isPrimaryApiStable = true;
let axiosSwitchedMessageSent = false;

module.exports.config = {
    name: "ai",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Jonell Magallanes",
    description: "EDUCATIONAL",
    usePrefix: false,
    commandCategory: "other",
    usages: "[question]",
    cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
    const content = encodeURIComponent(args.join(" "));
    const uid = event.senderID;

    const apiUrl = isPrimaryApiStable ? `${primaryApiUrl}?prompt=${content}` : `${secondaryApiUrl}?input=${content}`;
    const apiName = isPrimaryApiStable ? 'Original Axios' : 'Secondary Axios';

    if (!content) return api.sendMessage("Please provide your question.\n\nExample: ai what is the solar system?", event.threadID, event.messageID);

    try {
        api.sendMessage(`🔍 | AI is searching for your answer. Please wait...`, event.threadID, event.messageID);

        const response = await axios.get(apiUrl);
        const result = isPrimaryApiStable ? response.data.result.gptResult.gpt : response.data.result;

        if (!result) {
            throw new Error("Axios response is undefined");
        }

        const userData = await getUserData(uid);
        userData.responses = userData.responses || [];
        userData.responses.push({ question: content, response: result });
        await saveUserData(uid, userData, apiName);

        recordChat(uid, content);

        const userNames = await getUserNames(api, uid);

        const responseMessage = `${result}\n\n👤 Question Asked by: ${userNames.join(', ')}`;
        api.sendMessage(responseMessage, event.threadID, event.messageID);

        await saveAxiosStatus(apiName);

        if (!isPrimaryApiStable && !axiosSwitchedMessageSent) {
            isPrimaryApiStable = true;
            axiosSwitchedMessageSent = true;
            api.sendMessage("🔃 | Switching back to the original Axios. Just please wait.", event.threadID);
        }

    } catch (error) {
        console.error(error);

        try {
            api.sendMessage(`🔄 | Trying Switching API!\n\nReason: ${error.response.status || error.code}`, event.threadID);
            const backupResponse = await axios.get(`${secondaryApiUrl}?input=${content}`);
            const backupResult = backupResponse.data.result;

            if (!backupResult) {
                throw new Error("Secondary Axios response is undefined");
            }

            const userData = await getUserData(uid);
            userData.responses = userData.responses || [];
            userData.responses.push({ question: content, response: backupResult });
            await saveUserData(uid, userData, 'Secondary Axios');

            const userNames = await getUserNames(api, uid);

            const responseMessage = `${backupResult}\n\n👤 Question Asked by: ${userNames.join(', ')}`;
            api.sendMessage(responseMessage, event.threadID, event.messageID);

            isPrimaryApiStable = false;

            await saveAxiosStatus('Secondary Axios');

        } catch (backupError) {
            console.error(backupError);
            api.sendMessage("An error occurred while processing your request.", event.threadID);

            await saveAxiosStatus('Unknown');
        }
    }
};

async function getUserData(uid) {
    try {
        const data = await fs.readFile(storageFile, 'utf-8');
        const jsonData = JSON.parse(data);
        return jsonData[uid] || {};
    } catch (error) {
        return {};
    }
}

async function saveUserData(uid, data, apiName) {
    try {
        const existingData = await getUserData(uid);
        const newData = { ...existingData, ...data, apiUsed: apiName };
        const allData = await getAllUserData();
        allData[uid] = newData;
        await fs.writeFile(storageFile, JSON.stringify(allData, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

async function getUserNames(api, uid) {
    try {
        const userInfo = await api.getUserInfo([uid]);
        return Object.values(userInfo).map(user => user.name || `User${uid}`);
    } catch (error) {
        console.error('Error getting user names:', error);
        return [];
    }
}

async function getAllUserData() {
    try {
        const data = await fs.readFile(storageFile, 'utf-8');
        return JSON.parse(data) || {};
    } catch (error) {
        return {};
    }
}

function recordChat(uid, question) {
    try {
        const chatRecords = getChatRecords();
        const userChat = chatRecords[uid] || [];
        userChat.push({ timestamp: Date.now(), question });
        chatRecords[uid] = userChat;
        fs.writeFile(chatRecordFile, JSON.stringify(chatRecords, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error recording chat:', error);
    }
}

function getChatRecords() {
    try {
        const data = fs.readFileSync(chatRecordFile, 'utf-8');
        return JSON.parse(data) || {};
    } catch (error) {
        return {};
    }
}

async function saveAxiosStatus(apiName) {
    try {
        await fs.writeFile(axiosStatusFile, JSON.stringify({ axiosUsed: apiName }), 'utf-8');
    } catch (error) {
        console.error('Error saving Axios status:', error);
    }
}
