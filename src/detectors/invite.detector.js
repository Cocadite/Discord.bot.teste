const { normalizeMessage } = require("../utils/normalize");

function hasDiscordInvite(content) {
  const c = normalizeMessage(content);
  return (
    c.includes("discord.gg/") ||
    c.includes("discord.com/invite/") ||
    c.includes("discordapp.com/invite/")
  );
}

module.exports = { hasDiscordInvite };
