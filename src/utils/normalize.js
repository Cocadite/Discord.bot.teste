function normalizeMessage(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.\s\/:-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function squashSpaces(str) {
  return (str || "").replace(/\s+/g, "");
}

module.exports = { normalizeMessage, squashSpaces };
