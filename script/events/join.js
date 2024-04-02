const fs = require("fs");
const axios = require("axios");
const moment = require("moment"); // Make sure to install 'moment' using npm install moment

module.exports.config = {
    name: "join",
    eventType: ['log:subscribe'],
    version: "1.0.0",
    credits: "Mirai-Team", // mod by Jonell Magallanes 
    description: "GROUP UPDATE NOTIFICATION"
};

module.exports.run = async function ({ api, event, Users, Threads }) {
    function reply(data) {
        api.sendMessage(data, event.threadID, event.messageID);
    }

    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        api.changeNickname(`${global.config.BOTNAME} • [ ${global.config.PREFIX} ]`, event.threadID, api.getCurrentUserID());
        return reply(`✅ | ${global.config.BOTNAME} connected successfully!\nType "${global.config.PREFIX}help" to view all commands\n\nContact the admin if you encounter an error.\n\n👷Developer: Jonell Magallanes`);
    } else {
        try {
            const {
                threadID
            } = event;
            let {
                threadName,
                participantIDs
            } = await api.getThreadInfo(threadID);
            var tn = threadName || "Unnamed group";
            var mentions = [],
                nameArray = [],
                i = 0;
            let addedParticipants1 = event.logMessageData.addedParticipants;

            for (let newParticipant of addedParticipants1) {
                let userID = newParticipant.userFbId;
                let senderID = newParticipant.userFbId; // Use newParticipant.userFbId as the sender ID
                api.getUserInfo(parseInt(userID), (err, data) => {
                    if (err) {
                        return console.log(err);
                    }
                    var obj = Object.keys(data);
                    var firstName = data[obj].firstName;
                    var userName = data[obj].name.replace("@", "");

                    if (userID !== api.getCurrentUserID()) {
                        nameArray.push(userName);
                        mentions.push({
                            tag: userName,
                            id: userID,
                            fromIndex: 0
                        });
                        let avt = ["https://i.postimg.cc/pTGHDKnY/images-2023-08-19-T230758-444.jpg", "https://i.postimg.cc/pd0WBwwF/images-2023-08-19-T230807-555.jpg", "https://i.postimg.cc/gkvG7L9d/images-2023-08-19-T230828-578.jpg", "https://i.postimg.cc/XNfXtYyf/images-2023-08-19-T230845-301.jpg"];
                        var avt1 = avt[Math.floor(Math.random() * avt.length)];

                        let firstName = nameArray[0].split(" ")[0];

                        let requestURL = `https://joinotinewbyjonell-ca7aeccac589.herokuapp.com/join2?name=${firstName}&id=${senderID}&background=${avt1}&count=${participantIDs.length}`;

                        axios.get(encodeURI(requestURL), { responseType: 'arraybuffer' })
                            .then(response => {
                                fs.writeFileSync(`come.jpg`, Buffer.from(response.data, 'binary'));
                                let welcomeText = `Hello ${userName}!\nWelcome to ${tn}\nYou're the ${participantIDs.length}th member on this group. Enjoy!`;

                                return reply({
                                    body: welcomeText,
                                    attachment: fs.createReadStream(`come.jpg`),
                                    mentions
                                }, () => fs.unlinkSync(`come.jpg`));
                            })
                            .catch(error => console.log("Axios Error: ", error));
                    }
                })
            }
        } catch (err) {
            return console.log("ERROR: " + err);
        }
    }
};
