const RAID_TERMS = require("../constants/raidTerms");
const { normalizeMessage, squashSpaces } = require("../utils/normalize");

function hasRaidTerm(content) {
  const norm = normalizeMessage(content);
  const squashed = squashSpaces(norm);
  return RAID_TERMS.some(t => norm.startsWith(t) || squashed.includes(t));
}

module.exports = { hasRaidTerm };
