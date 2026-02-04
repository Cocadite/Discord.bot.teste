const { AuditLogEvent } = require("discord.js");

async function findExecutorForChannel(guild, auditEvent, channelId) {
  try {
    const logs = await guild.fetchAuditLogs({ type: auditEvent, limit: 6 }).catch(() => null);
    if (!logs) return null;

    const now = Date.now();
    const entry = [...logs.entries.values()].find(e => {
      if (!e?.target) return false;
      const age = now - e.createdTimestamp;
      return e.target.id === channelId && age >= 0 && age <= 10000; // buffer 10s
    });

    return entry?.executor || null;
  } catch {
    return null;
  }
}

module.exports = { findExecutorForChannel, AuditLogEvent };
