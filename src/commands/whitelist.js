const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../config/default.json");
const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));

function save() {
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
}

function listText() {
  const u = cfg.whitelist.users.length ? cfg.whitelist.users.map(id => `• <@${id}>`).join("\n") : "Nenhum";
  const r = cfg.whitelist.roles.length ? cfg.whitelist.roles.map(id => `• <@&${id}>`).join("\n") : "Nenhum";
  const c = cfg.whitelist.channels.length ? cfg.whitelist.channels.map(id => `• <#${id}>`).join("\n") : "Nenhum";
  return `📜 **Whitelist (TESTE)**\n\n👤 Usuários:\n${u}\n\n🏷️ Cargos:\n${r}\n\n📺 Canais:\n${c}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Gerenciar whitelist do anti-raid (TESTE)")
    .addSubcommand(s =>
      s.setName("add")
        .setDescription("Adicionar")
        .addStringOption(o => o.setName("type").setDescription("Tipo").setRequired(true)
          .addChoices(
            { name: "user", value: "users" },
            { name: "role", value: "roles" },
            { name: "channel", value: "channels" }
          ))
        .addStringOption(o => o.setName("id").setDescription("ID").setRequired(true))
    )
    .addSubcommand(s =>
      s.setName("remove")
        .setDescription("Remover")
        .addStringOption(o => o.setName("type").setDescription("Tipo").setRequired(true)
          .addChoices(
            { name: "user", value: "users" },
            { name: "role", value: "roles" },
            { name: "channel", value: "channels" }
          ))
        .addStringOption(o => o.setName("id").setDescription("ID").setRequired(true))
    )
    .addSubcommand(s => s.setName("list").setDescription("Listar"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === "list") return interaction.reply({ content: listText(), ephemeral: true });

    const type = interaction.options.getString("type");
    const id = interaction.options.getString("id");

    if (!cfg.whitelist[type]) cfg.whitelist[type] = [];

    if (sub === "add") {
      if (!cfg.whitelist[type].includes(id)) {
        cfg.whitelist[type].push(id);
        save();
      }
      return interaction.reply({ content: `✅ (TESTE) Adicionado whitelist (${type}): ${id}`, ephemeral: true });
    }

    if (sub === "remove") {
      cfg.whitelist[type] = cfg.whitelist[type].filter(x => x !== id);
      save();
      return interaction.reply({ content: `✅ (TESTE) Removido whitelist (${type}): ${id}`, ephemeral: true });
    }
  }
};
