const fs = require("fs");
const path = require("path");

const statePath = path.join(__dirname, "state.json");

function defaultState() {
  return {
    lockdown: {
      active: false,
      startedAt: 0,
      endsAt: 0,
      channelOverwriteBackup: {}
    }
  };
}

function readState() {
  if (!fs.existsSync(statePath)) {
    const s = defaultState();
    fs.writeFileSync(statePath, JSON.stringify(s, null, 2));
    return s;
  }
  try {
    return JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch {
    const s = defaultState();
    fs.writeFileSync(statePath, JSON.stringify(s, null, 2));
    return s;
  }
}

function writeState(state) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

module.exports = { readState, writeState };
