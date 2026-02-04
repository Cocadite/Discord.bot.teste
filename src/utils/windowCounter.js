class WindowCounter {
  constructor(windowMs) {
    this.windowMs = windowMs;
    this.map = new Map();
  }

  hit(key) {
    const now = Date.now();
    const cur = this.map.get(key);
    if (!cur || now - cur.ts > this.windowMs) {
      this.map.set(key, { ts: now, count: 1 });
      return 1;
    }
    cur.count += 1;
    return cur.count;
  }
}

module.exports = { WindowCounter };
