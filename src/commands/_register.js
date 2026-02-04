require("dotenv").config();
const { REST, Routes } = require("discord.js");
const whitelist = require("./whitelist");
const anti = require("./anti");

async function main() {
  const token = process.env.TOKEN;
  const guildId = process.env.GUILD_ID;
  const clientId = process.env.CLIENT_ID;

  if (!token) throw new Error("TOKEN faltando no .env");
  if (!guildId) throw new Error("GUILD_ID faltando no .env");
  if (!clientId) throw new Error("CLIENT_ID faltando no .env");

  const rest = new REST({ version: "10" }).setToken(token);
  const commands = [whitelist.data.toJSON(), anti.data.toJSON()];

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
  console.log("✅ (TESTE) Slash commands registrados.");
}

main();
