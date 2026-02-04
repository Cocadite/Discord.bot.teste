const { logToChannel } = require("../utils/logger");

module.exports = async (client, cfg) => {
  console.log(`✅ Online como ${client.user.tag}`);
  await logToChannel(client, cfg, `✅ (TESTE) Bot online como **${client.user.tag}**`);
};
