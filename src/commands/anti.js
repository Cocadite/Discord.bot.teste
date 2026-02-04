const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { activateLockdown, isLockdownActive } = require("../services/lockdown.service");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anti")
    .setDescription("Controle do anti-raid (TESTE)")
    .addSubcommand(s => s.setName("status").setDescription("Mostra status"))
    .addSubcommand(s => s.setName("lockdown").setDescription("Ativar lockdown 60s"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client, cfg) {
    const sub = interaction.options.getSubcommand();

    if (sub === "status") {
      return interaction.reply({
        content: `🧪 Status: LOCKDOWN = **${isLockdownActive() ? "ATIVO" : "OFF"}**`,
        ephemeral: true
      });
    }

    if (sub === "lockdown") {
      // Só OWNER pode forçar lockdown
      if (interaction.user.id !== cfg.ownerId) {
        return interaction.reply({ content: "❌ Só o OWNER_ID pode usar isso.", ephemeral: true });
      }
      await activateLockdown(client, cfg, interaction.guild, cfg.lockdown.durationSeconds);
      return interaction.reply({ content: "⏳ LOCKDOWN (TESTE) ativado por 60s.", ephemeral: true });
    }
  }
};
