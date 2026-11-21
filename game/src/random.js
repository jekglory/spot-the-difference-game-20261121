// Deterministic pseudo-random numbers (mulberry32). The game itself does not
// need randomness for its scenes — every picture is drawn from fixed
// coordinates — but staged effects (fireflies, twinkling stars) use a seeded
// generator so a screenshot is the same on every load.

// mulberry32: a tiny, well-known 32-bit seeded PRNG.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick `count` distinct items from an array with a seeded generator, keeping
// their original order. Used to choose which unfound difference a hint rings.
export function pickSeeded(items, count, seed) {
  const rand = mulberry32(seed);
  const pool = items.slice();
  const picked = [];
  while (pool.length > 0 && picked.length < count) {
    const i = Math.floor(rand() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}
