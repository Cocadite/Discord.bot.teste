const fs = require("fs");
const path = require("path");

function loadConfig() {
  const p = path.join(__dirname, "../../config/default.json");
  const cfg = JSON.parse(fs.readFileSync(p, "utf8"));

  if (process.env.LOG_CHANNEL_ID) cfg.logChannelId = process.env.LOG_CHANNEL_ID;
  if (process.env.OWNER_ID) cfg.ownerId = process.env.OWNER_ID;
  if (process.env.STAFF_ROLE_ID) cfg.staffRoleId = process.env.STAFF_ROLE_ID;

  if (!cfg.ownerId) throw new Error("OWNER_ID não definido (env ou config).");
  if (!cfg.staffRoleId) throw new Error("STAFF_ROLE_ID não definido (env ou config).");
  if (!cfg.logChannelId) throw new Error("LOG_CHANNEL_ID não definido (env ou config).");

  return cfg;
}

module.exports = { loadConfig };
