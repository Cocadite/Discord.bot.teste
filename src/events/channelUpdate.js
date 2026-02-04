const { WindowCounter } = require("../utils/windowCounter");
const { isWhitelisted } = require("../utils/whitelist");
const { punishMember } = require("../utils/punish");
const { activateLockdown } = require("../services/lockdown.service");
const { findExecutorForChannel, AuditLogEvent } = require("../services/auditlog.service");

module.exports = (client, cfg) => {
  const counter = new WindowCounter(cfg.thresholds.windowMs);

  client.on("channelUpdate", async (oldCh, newCh) => {
    if (!newCh.guild) return;
    if (oldCh.name === newCh.name) return;

    const guild = newCh.guild;
    const executor = await findExecutorForChannel(guild, AuditLogEvent.ChannelUpdate, newCh.id);
    if (!executor) return;
    if (executor.id === cfg.ownerId) return;

    const member = await guild.members.fetch(executor.id).catch(() => null);
    const wl = isWhitelisted(cfg, { member, userId: executor.id, channelId: newCh.id });

    const count = counter.hit(`rename:${executor.id}`);
    const combo = counter.hit(`combo:${executor.id}`);

    if (!wl && (count >= cfg.thresholds.renameCount || combo >= cfg.thresholds.channelAbuseComboCount)) {
      await punishMember({ client, cfg, member, reason: "Channel rename spam (>=2 em 1s) (TESTE)", action: "kick" });
      await activateLockdown(client, cfg, guild, cfg.lockdown.durationSeconds);
    }
  });
};
