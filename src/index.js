require("dotenv").config();
const { makeClient } = require("./client");
const { loadConfig } = require("./config/loadConfig");
const { maybeAutoUnlock } = require("./services/lockdown.service");

const ready = require("./events/ready");
const messageCreate = require("./events/messageCreate");
const guildMemberAdd = require("./events/guildMemberAdd");
const channelUpdate = require("./events/channelUpdate");
const channelCreate = require("./events/channelCreate");
const channelDelete = require("./events/channelDelete");

const whitelistCmd = require("./commands/whitelist");
const antiCmd = require("./commands/anti");

async function main() {
  const cfg = loadConfig();
  const client = makeClient();

  client.once("ready", async () => {
    await ready(client, cfg);
    // loop para auto-unlock do lockdown
    setInterval(() => {
      if (client.guilds.cache.size === 0) return;
      for (const [, g] of client.guilds.cache) {
        maybeAutoUnlock(client, cfg, g).catch(() => {});
      }
    }, 1000);
  });

  // eventos
  messageCreate(client, cfg);
  guildMemberAdd(client, cfg);
  channelUpdate(client, cfg);
  channelCreate(client, cfg);
  channelDelete(client, cfg);

  // commands handler
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
      if (interaction.commandName === "whitelist") return whitelistCmd.execute(interaction);
      if (interaction.commandName === "anti") return antiCmd.execute(interaction, client, cfg);
    } catch (e) {
      console.error(e);
      if (!interaction.replied) {
        await interaction.reply({ content: "❌ Erro ao executar comando.", ephemeral: true }).catch(() => {});
      }
    }
  });

  await client.login(process.env.TOKEN);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
