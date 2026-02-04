function isWhitelisted(cfg, { member, userId, channelId }) {
  if (userId && cfg.whitelist.users.includes(userId)) return true;
  if (channelId && cfg.whitelist.channels.includes(channelId)) return true;

  if (member && member.roles?.cache) {
    if (cfg.whitelist.roles.some(rid => member.roles.cache.has(rid))) return true;
  }
  return false;
}

module.exports = { isWhitelisted };
