import { MONTH_NAMES, type ChartRow, type Hit, type MonthName, type Question } from "../types";

/** One-time rule text shown in the round-1 popup. */
export const SESSION_INSTRUCTIONS =
  "Tap the Month of the Top 100 Billboard hit before the blocks bury you. " +
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
 * Picks a random hit and builds a month question for it: the clue is the hit's song title,
 * the correct answer is one of the months it actually charted, and the 2 wrong answers are
 * months it did NOT chart in (so a wrong answer never doubles as a technically-correct one).
 * Answers may repeat across rounds/hits — only within a single round are they kept distinct.
 */
export function generateQuestion(allHits: Hit[]): Question {
  if (allHits.length < 3) {
    throw new Error("Need at least 3 hits in the dataset to generate a question with distractors.");
  }

  const hit = pickRandom(allHits);
  const correctAnswer = pickRandom([...hit.months]);

  const dataPool = allHits.flatMap((h) => [...h.months]);
  let wrong = sampleDistinct(dataPool, 2, hit.months as Set<MonthName>);

  // Fallback in case the dataset doesn't have 2 real months outside this hit's own set.
  if (wrong.length < 2) {
    wrong = sampleDistinct(MONTH_NAMES, 2, hit.months as Set<MonthName>);
  }

  return {
    category: hit.performer,
    subcategory: String(hit.year),
    clue: hit.title,
    correctAnswer,
    wrongAnswers: [wrong[0], wrong[1]],
  };
}
