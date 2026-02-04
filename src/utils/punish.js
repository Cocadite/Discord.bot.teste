const { logToChannel } = require("./logger");

async function deleteIfPossible(message) {
  if (message && message.deletable) {
    await message.delete().catch(() => {});
  }
}

async function punishMember({ client, cfg, member, reason, action = "kick", timeoutMinutes = 1 }) {
  if (!member) return { ok: false, err: "no_member" };

  // Nunca pune o OWNER_ID
  if (member.id === cfg.ownerId) return { ok: true, skipped: true };

  try {
    if (action === "timeout") {
      await member.timeout(timeoutMinutes * 60 * 1000, reason);
    } else if (action === "kick") {
      await member.kick(reason);
    }
    await logToChannel(
      client,
      cfg,
      `⚠️ Punição: **${action}** | Usuário: <@${member.id}> (\`${member.user?.tag || "?"}\`) | Motivo: \`${reason}\``
    );
    return { ok: true };
  } catch (e) {
    await logToChannel(
      client,
      cfg,
      `❌ Falha ao punir (**${action}**) <@${member.id}>: \`${e?.message || e}\` | Motivo: \`${reason}\``
    );
    return { ok: false, err: e };
  }
}

module.exports = { deleteIfPossible, punishMember };
