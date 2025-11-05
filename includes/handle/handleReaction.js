module.exports = function ({ api, models, Users, Threads, Currencies }) {
  return async function ({ event }) {
    const { handleReaction = [], commands } = global.client || {};
    const { messageID, threadID } = event || {};
    if (!Array.isArray(handleReaction) || handleReaction.length === 0) return;
    if (!messageID) return;
    const index = handleReaction.findIndex(e => e && e.messageID === messageID);
    if (index < 0) return;
    const entry = handleReaction[index];
    const mapValues = typeof commands?.values === "function" ? [...commands.values()] : [];
    const cmd =
      commands?.get?.(entry.name) ||
      mapValues.find(c => c?.config?.name === entry.name || (Array.isArray(c?.config?.aliases) && c.config.aliases.includes(entry.name)));
    if (!cmd || typeof cmd.handleReaction !== "function") return api.sendMessage(global.getText("handleReaction", "missingValue"), threadID, messageID);
    try {
      const getText2 = (...value) => {
        const langKey = global.config?.language;
        const dict = cmd.languages || {};
        if (!langKey || !Object.prototype.hasOwnProperty.call(dict, langKey)) {
          api.sendMessage(global.getText("handleCommand", "notFoundLanguage", cmd.config?.name || entry.name), threadID, messageID);
          return "";
        }
        let out = dict[langKey]?.[value[0]] || "";
        for (let i = 1; i < value.length; i++) {
          const re = new RegExp("%" + i, "g");
          out = out.replace(re, String(value[i]));
        }
        return out;
      };
      const Obj = {
        api,
        event,
        models,
        Users,
        Threads,
        Currencies,
        handleReaction: entry,
        getText: getText2
      };
      await cmd.handleReaction(Obj);
    } catch (error) {
      return api.sendMessage(global.getText("handleReaction", "executeError", String(error && error.message ? error.message : error)), threadID, messageID);
    }
  };
};
