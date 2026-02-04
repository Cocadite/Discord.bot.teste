const { WindowCounter } = require("../utils/windowCounter");
const { isWhitelisted } = require("../utils/whitelist");
const { punishMember } = require("../utils/punish");
const { activateLockdown } = require("../services/lockdown.service");
const { findExecutorForChannel, AuditLogEvent } = require("../services/auditlog.service");

module.exports = (client, cfg) => {
  const counter = new WindowCounter(cfg.thresholds.windowMs);

  client.on("channelCreate", async (channel) => {
    const guild = channel.guild;
    const executor = await findExecutorForChannel(guild, AuditLogEvent.ChannelCreate, channel.id);
    if (!executor) return;
    if (executor.id === cfg.ownerId) return;

    const member = await guild.members.fetch(executor.id).catch(() => null);
    const wl = isWhitelisted(cfg, { member, userId: executor.id, channelId: channel.id });

    const c1 = counter.hit(`create:${executor.id}`);
    const combo = counter.hit(`combo:${executor.id}`);

    if (!wl && (c1 >= cfg.thresholds.channelCreateCount || combo >= cfg.thresholds.channelAbuseComboCount)) {
      await punishMember({ client, cfg, member, reason: "Channel create spam (>=2 em 1s) (TESTE)", action: "kick" });
      await activateLockdown(client, cfg, guild, cfg.lockdown.durationSeconds);
    }
  });
};
