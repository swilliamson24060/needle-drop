import type { ChartRow, Hit, Question } from "../types";

/** One-time rule text shown in the round-1 popup. */
export const SESSION_INSTRUCTIONS =
  "Tap the correct Song Title for the artist and year shown before the blocks bury you. " +
  "3 correct erases a line, a wrong answer adds a block to the bottom.";

/** Groups raw chart rows into one Hit per (performer, year, title), collecting every month it charted. */
export function buildHits(rows: ChartRow[]): Hit[] {
  const hitsByKey = new Map<string, Hit>();

  for (const row of rows) {
    const key = `${row.performer}::${row.year}::${row.title}`;
    let hit = hitsByKey.get(key);
    if (!hit) {
      hit = { performer: row.performer, year: row.year, title: row.title, months: new Set() };
      hitsByKey.set(key, hit);
    }
    hit.months.add(row.month);
  }

  return [...hitsByKey.values()];
}

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function pickRandom<T>(items: readonly T[]): T {
  return items[randomInt(items.length)];
}

/** Picks `count` distinct values from `pool`, skipping anything in `exclude`. */
function sampleDistinct<T>(pool: readonly T[], count: number, exclude: Set<T>): T[] {
  const candidates = [...new Set(pool)].filter((item) => !exclude.has(item));
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, count);
}

/**
 * Picks a random hit and builds a title question for it: the performer and year are shown
 * in the ribbon, and the 3 falling answers are the hit's real title plus 2 other real song
 * titles pulled from elsewhere in the dataset.
 */
export function generateQuestion(allHits: Hit[]): Question {
  if (allHits.length < 3) {
    throw new Error("Need at least 3 hits in the dataset to generate a question with distractors.");
  }

  const hit = pickRandom(allHits);
  const correctTitle = hit.title;

  const dataPool = allHits.filter((h) => h.title !== correctTitle).map((h) => h.title);
  const wrong = sampleDistinct(dataPool, 2, new Set([correctTitle]));

  return {
    category: hit.performer,
    subcategory: String(hit.year),
    answers: [
      { title: correctTitle, isCorrect: true },
      { title: wrong[0], isCorrect: false },
      { title: wrong[1], isCorrect: false },
    ],
  };
}
