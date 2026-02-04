const { WindowCounter } = require("../utils/windowCounter");
const { isJoinFlood } = require("../detectors/joinFlood.detector");
const { activateLockdown } = require("../services/lockdown.service");
const { logToChannel } = require("../utils/logger");

module.exports = (client, cfg) => {
  const counter = new WindowCounter(cfg.thresholds.windowMs);

  client.on("guildMemberAdd", async (member) => {
    const c = counter.hit(`join:${member.guild.id}`);
    if (isJoinFlood(c, cfg.thresholds.joinFloodCount)) {
      await logToChannel(client, cfg, `🚪 (TESTE) Join flood: ${c} joins em 1s. Lockdown 60s.`);
      await activateLockdown(client, cfg, member.guild, cfg.lockdown.durationSeconds);
    }
  });
};
