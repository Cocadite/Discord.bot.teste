function hasAttachment(message) {
  return !!(message.attachments && message.attachments.size > 0);
}

module.exports = { hasAttachment };
