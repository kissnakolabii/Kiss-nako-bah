const fs = require("fs");
const axios = require("axios");

module.exports.config = {
    name: "leaveNoti",
    eventType: ["log:unsubscribe"],
    version: "1.0.0",
    credits: "Deku",
    description: "Notify left members",
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
};

module.exports.run = async function({ api, event, Users, Threads }) {
    function reply(data) {
        api.sendMessage(data, event.threadID, event.messageID);
    }

    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    let { threadName, participantIDs } = await api.getThreadInfo(event.threadID);
    const type = (event.author == event.logMessageData.leftParticipantFbId) ? "left the group." : "kicked by Admin of the group";
    let pathh = __dirname + `/cache/bye.png`;
    let name = (await api.getUserInfo(event.logMessageData.leftParticipantFbId))[event.logMessageData.leftParticipantFbId].name;
    let avt = ["https://i.postimg.cc/wMWZwp7p/images-2024-04-02-T195017-832.jpg", "https://i.postimg.cc/4xXwmMdv/images-2024-04-02-T195026-517.jpg", "https://i.postimg.cc/kGc6Zjm9/images-2024-04-02-T195041-233.jpg", "https://i.postimg.cc/5Ny2b958/images-2024-04-02-T195048-119.jpg"];
    let avt1 = avt[Math.floor(Math.random() * avt.length)];
    const firstName = name.split(" ")[0]; // Extracting the first name

    let encodedUrl = `https://leavev2byjonellmagallanes-c0af5f501196.herokuapp.com/leave?name=${firstName}&id=${event.logMessageData.leftParticipantFbId}&background=${avt1}&count=${participantIDs.length}`;

    axios.get(encodeURI(encodedUrl), { responseType: 'arraybuffer' })
        .then(response => {
            fs.writeFileSync(pathh, Buffer.from(response.data, 'binary'));
            reply({
                body: `${name} has been ${type}\nMember’s left: ${participantIDs.length}`,
                attachment: fs.createReadStream(pathh)
            });
        })
        .catch(error => console.log("Axios Error: ", error));
};
