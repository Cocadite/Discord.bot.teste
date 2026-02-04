async function logToChannel(client, cfg, content) {
  try {
    const ch = await client.channels.fetch(cfg.logChannelId).catch(() => null);
    if (!ch) return;
    await ch.send({ content: content.slice(0, 1900) }).catch(() => {});
  } catch {}
}

module.exports = { logToChannel };
