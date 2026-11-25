// Seeded chance, so a screenshot seed always deals the same orders and the
// same kitchen. Mulberry32: small, fast, and good enough for a game.
export function createRandom(seed) {
  let state = seed >>> 0;
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    },
    nextInt(count) {
      return Math.floor(this.next() * count);
    },
    pick(list) {
      return list[this.nextInt(list.length)];
    },
  };
}
