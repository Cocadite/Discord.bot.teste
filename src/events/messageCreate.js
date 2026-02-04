const { WindowCounter } = require("../utils/windowCounter");
const { isWhitelisted } = require("../utils/whitelist");
const { deleteIfPossible, punishMember } = require("../utils/punish");
const { hasRaidTerm } = require("../detectors/raidTerms.detector");
const { hasDiscordInvite } = require("../detectors/invite.detector");
const { hasAttachment } = require("../detectors/attachments.detector");
const { isFlood } = require("../detectors/spam.detector");
const { activateLockdown, isLockdownActive } = require("../services/lockdown.service");

module.exports = (client, cfg) => {
  const counter = new WindowCounter(cfg.thresholds.windowMs);

  client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;

    // Durante lockdown: só OWNER ou STAFF_ROLE
    if (isLockdownActive()) {
      const isOwner = message.author.id === cfg.ownerId;
      const hasStaff = message.member?.roles?.cache?.has(cfg.staffRoleId);
      if (!isOwner && !hasStaff) {
        await deleteIfPossible(message);
        return;
      }
    }

    const wl = isWhitelisted(cfg, { member: message.member, userId: message.author.id, channelId: message.channel.id });

    const msgCount = counter.hit(`msg:${message.author.id}`);
    const inviteHit = hasDiscordInvite(message.content) ? counter.hit(`invite:${message.author.id}`) : 0;
    const attachHit = hasAttachment(message) ? counter.hit(`attach:${message.author.id}`) : 0;

    // RAID TERMS => KICK + LOCKDOWN
    if (!wl && hasRaidTerm(message.content)) {
      await deleteIfPossible(message);
      const res = await punishMember({ client, cfg, member: message.member, reason: "Raid keyword (TESTE)", action: "kick" });
      await activateLockdown(client, cfg, message.guild, cfg.lockdown.durationSeconds);
      return;
    }

    // INVITE: 2 em 1s => KICK + LOCKDOWN | 1 => timeout + lockdown
    if (!wl && hasDiscordInvite(message.content)) {
      await deleteIfPossible(message);

      if (inviteHit >= cfg.thresholds.inviteCount) {
        await punishMember({ client, cfg, member: message.member, reason: "Invite spam (2 em 1s) (TESTE)", action: "kick" });
      } else {
        await punishMember({
          client,
          cfg,
          member: message.member,
          reason: "Invite link (TESTE)",
          action: "timeout",
          timeoutMinutes: cfg.actions.normalInviteTimeoutMinutes || 1
        });
      }
      await activateLockdown(client, cfg, message.guild, cfg.lockdown.durationSeconds);
      return;
    }

    // ANEXO: 2 em 1s => KICK + LOCKDOWN
    if (!wl && hasAttachment(message) && attachHit >= cfg.thresholds.attachmentCount) {
      await deleteIfPossible(message);
      await punishMember({ client, cfg, member: message.member, reason: "Attachment spam (2 em 1s) (TESTE)", action: "kick" });
      await activateLockdown(client, cfg, message.guild, cfg.lockdown.durationSeconds);
      return;
    }

    // FLOOD: 5 msgs em 1s => KICK + LOCKDOWN
    if (!wl && isFlood(msgCount, cfg.thresholds.spamMsgCount)) {
      await deleteIfPossible(message);
      await punishMember({ client, cfg, member: message.member, reason: "Flood (5 msgs em 1s) (TESTE)", action: "kick" });
      await activateLockdown(client, cfg, message.guild, cfg.lockdown.durationSeconds);
      return;
    }
  });
};
