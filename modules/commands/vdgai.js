module.exports.config = {
  name: "vdgai",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "Donix",
  description: "vdgai",
  commandCategory: "group",
  usages: "[Text]",
  cooldowns: 0
};

module.exports.run = async function ({ api, event, args }) {
  try {
    return api.sendMessage({ attachment: global.client.queues.splice(0, 1) }, event.threadID, event.messageID);
  }
  catch (e) { return console.log(e); }
}
