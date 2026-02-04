const { readState, writeState } = require("../storage/store");
const { logToChannel } = require("../utils/logger");

function isLockdownActive() {
  const s = readState();
  return !!s.lockdown.active && Date.now() < (s.lockdown.endsAt || 0);
}

async function activateLockdown(client, cfg, guild, seconds) {
  const state = readState();

  const now = Date.now();
  const endsAt = now + seconds * 1000;

  // se já ativo, só estende
  if (state.lockdown.active && state.lockdown.endsAt && state.lockdown.endsAt > now) {
    state.lockdown.endsAt = Math.max(state.lockdown.endsAt, endsAt);
    writeState(state);
    return;
  }

  state.lockdown.active = true;
  state.lockdown.startedAt = now;
  state.lockdown.endsAt = endsAt;
  state.lockdown.channelOverwriteBackup = {};

  const everyoneId = guild.roles.everyone.id;
  const ownerId = cfg.ownerId;
  const staffRoleId = cfg.staffRoleId;

  const channels = await guild.channels.fetch().catch(() => null);
  if (channels) {
    for (const [, ch] of channels) {
      if (!ch?.permissionOverwrites) continue;
      const isTextLike = ch.isTextBased?.() && !ch.isThread?.() && ch.type !== 4;
      if (!isTextLike) continue;

      const overwrites = ch.permissionOverwrites.cache;
      const owEveryone = overwrites.get(everyoneId);
      const owOwner = overwrites.get(ownerId);
      const owStaff = overwrites.get(staffRoleId);

      state.lockdown.channelOverwriteBackup[ch.id] = {
        everyone: owEveryone ? true : false,
        owner: owOwner ? true : false,
        staff: owStaff ? true : false
      };

      // trava geral
      await ch.permissionOverwrites.edit(everyoneId, {
        SendMessages: false,
        AddReactions: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false,
        SendMessagesInThreads: false
      }).catch(() => {});

      // libera owner
      await ch.permissionOverwrites.edit(ownerId, {
        SendMessages: true,
        AddReactions: true,
        SendMessagesInThreads: true
      }).catch(() => {});

      // libera staff role (único permitido além do owner)
      await ch.permissionOverwrites.edit(staffRoleId, {
        SendMessages: true,
        AddReactions: true,
        SendMessagesInThreads: true
      }).catch(() => {});
    }
  }

  writeState(state);
  await logToChannel(client, cfg, `⏳ **LOCKDOWN (TESTE) ATIVADO por ${seconds}s**: só <@${ownerId}> e <@&${staffRoleId}> podem falar.`);
}

async function maybeAutoUnlock(client, cfg, guild) {
  const state = readState();
  if (!state.lockdown.active) return;
  if (Date.now() < (state.lockdown.endsAt || 0)) return;

  // desbloquear: apenas remover as permissões que setamos (best effort)
  const everyoneId = guild.roles.everyone.id;
  const ownerId = cfg.ownerId;
  const staffRoleId = cfg.staffRoleId;

  const channels = await guild.channels.fetch().catch(() => null);
  if (channels) {
    for (const [, ch] of channels) {
      if (!ch?.permissionOverwrites) continue;
      const isTextLike = ch.isTextBased?.() && !ch.isThread?.() && ch.type !== 4;
      if (!isTextLike) continue;

      await ch.permissionOverwrites.edit(everyoneId, {
        SendMessages: null,
        AddReactions: null,
        CreatePublicThreads: null,
        CreatePrivateThreads: null,
        SendMessagesInThreads: null
      }).catch(() => {});

      await ch.permissionOverwrites.edit(ownerId, {
        SendMessages: null,
        AddReactions: null,
        SendMessagesInThreads: null
      }).catch(() => {});

      await ch.permissionOverwrites.edit(staffRoleId, {
        SendMessages: null,
        AddReactions: null,
        SendMessagesInThreads: null
      }).catch(() => {});
    }
  }

  state.lockdown.active = false;
  state.lockdown.startedAt = 0;
  state.lockdown.endsAt = 0;
  state.lockdown.channelOverwriteBackup = {};
  writeState(state);
  await logToChannel(client, cfg, `✅ **LOCKDOWN (TESTE) finalizado**`);
}

module.exports = { isLockdownActive, activateLockdown, maybeAutoUnlock };
