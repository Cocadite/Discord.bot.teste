const { Client, GatewayIntentBits, Partials } = require("discord.js");

function makeClient() {
  return new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildModeration
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User]
  });
}

module.exports = { makeClient };
