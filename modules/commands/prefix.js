const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "prefix",
  version: "2.0.0",
  hasPermission: 0,
  credits: "DongDev",
  description: "prefix bot",
  commandCategory: "Hệ thống",
  usages: "[]",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event, client }) {
  const { threadID, body } = event;
  if (!body) return;

  const { PREFIX } = global.config;
  const gio = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || DD/MM/YYYY");

  let threadSetting = global.data.threadData.get(threadID) || {};
  let prefix = threadSetting.PREFIX || PREFIX;

  const lowerBody = body.toLowerCase();

  if (
    lowerBody === "prefix" ||
    lowerBody === "prefix bot là gì" ||
    lowerBody === "quên prefix r" ||
    lowerBody === "dùng sao"
  ) {
    api.sendMessage(
      `✏️ Prefix của nhóm: ${prefix}\n📎 Prefix hệ thống: ${PREFIX}`,
      threadID,
      event.messageID
    );
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, body } = event;
  const { PREFIX } = global.config;
  const gio = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || DD/MM/YYYY");

  let threadSetting = global.data.threadData.get(threadID) || {};
  let prefix = threadSetting.PREFIX || PREFIX;

  if (
    body && (body.toLowerCase() === "prefix" ||
      body.toLowerCase() === "prefix bot là gì" ||
      body.toLowerCase() === "quên prefix r" ||
      body.toLowerCase() === "dùng sao")
  ) {
    api.sendMessage(`|› Prefix của nhóm: ${prefix}\n|› Prefix hệ thống: ${global.config.PREFIX}\n`,
      event.threadID,
      event.messageID);
  }
};

module.exports.handleReaction = async function ({ api, event, Threads, handleReaction }) {
  try {
    if (event.userID != handleReaction.author) return;
    const { threadID, messageID } = event;
    var data = (await Threads.getData(String(threadID))).data || {};
    const prefix = handleReaction.PREFIX;
    data["PREFIX"] = prefix;
    await Threads.setData(threadID, { data });
    await global.data.threadData.set(String(threadID), data);
    api.unsendMessage(handleReaction.messageID);

    api.changeNickname(`『 ${prefix} 』 ⪼ ${global.config.BOTNAME}`, event.threadID, event.senderID);
    return api.sendMessage(`☑️ Đã thay đổi prefix của nhóm thành: ${prefix}`, threadID, messageID);

  } catch (e) {
    return console.log(e);
  }
};

module.exports.run = async ({ api, event, args, Threads }) => {
  if (typeof args[0] === "undefined") return api.sendMessage(`⚠️ Vui lòng nhập prefix mới để thay đổi prefix của nhóm`, event.threadID, event.messageID);
  const prefix = args[0].trim();
  if (!prefix) return api.sendMessage(`⚠️ Vui lòng nhập prefix mới để thay đổi prefix của nhóm`, event.threadID, event.messageID);
  if (prefix === "reset") {
    var data = (await Threads.getData(event.threadID)).data || {};
    data["PREFIX"] = global.config.PREFIX;
    await Threads.setData(event.threadID, { data });
    await global.data.threadData.set(String(event.threadID), data);
    var uid = api.getCurrentUserID();
    api.changeNickname(`『 ${global.config.PREFIX} 』 ⪼ ${global.config.BOTNAME}`, event.threadID, uid);
    return api.sendMessage(`☑️ Đã reset prefix về mặc định: ${global.config.PREFIX}`, event.threadID, event.messageID);
  } else {
    api.sendMessage(`📝 Bạn đang yêu cầu set prefix mới: ${prefix}\n👉 Reaction tin nhắn này để xác nhận`, event.threadID, (error, info) => {
      global.client.handleReaction.push({
        name: "prefix",
        messageID: info.messageID,
        author: event.senderID,
        PREFIX: prefix
      });
    });
  }
};
