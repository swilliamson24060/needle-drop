import { MONTH_NAMES, type AnswerOption, type ChartRow, type Hit, type MonthName, type Question } from "../types";

/** One-time rule text shown in the round-1 popup. */
export const SESSION_INSTRUCTIONS =
  "Tap the Month and Year of the Top 100 Billboard hit before the blocks bury you. " +
  "3 correct erases a line, a wrong answer adds a block to the bottom.";

const MAX_YEAR_OFFSET = 3;

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

/** A month that this hit did NOT chart in, so it's never accidentally also a true answer. */
function pickWrongMonth(hit: Hit, allHits: Hit[]): MonthName {
  const dataPool = allHits.flatMap((h) => [...h.months]);
  const candidates = sampleDistinct(dataPool, 1, hit.months as Set<MonthName>);
  if (candidates.length > 0) return candidates[0];
  return sampleDistinct(MONTH_NAMES, 1, hit.months as Set<MonthName>)[0];
}

/** A year within 3 years of `correctYear`, but never equal to it. */
function pickWrongYear(correctYear: number): number {
  let offset = 0;
  while (offset === 0) {
    offset = randomInt(2 * MAX_YEAR_OFFSET + 1) - MAX_YEAR_OFFSET;
  }
  return correctYear + offset;
}

function answersEqual(a: AnswerOption, b: AnswerOption): boolean {
  return a.month === b.month && a.year === b.year;
}

/** Builds one wrong answer: wrong month, wrong year, or both — chosen at random. */
function buildWrongAnswer(hit: Hit, allHits: Hit[], correctMonth: MonthName, correctYear: number): AnswerOption {
  const comboType = pickRandom(["wrongMonth", "wrongYear", "bothWrong"] as const);

  if (comboType === "wrongMonth") {
    return { month: pickWrongMonth(hit, allHits), year: correctYear, isCorrect: false };
  }
  if (comboType === "wrongYear") {
    return { month: correctMonth, year: pickWrongYear(correctYear), isCorrect: false };
  }
  return { month: pickWrongMonth(hit, allHits), year: pickWrongYear(correctYear), isCorrect: false };
}

/**
 * Picks a random hit and builds a month+year question for it: the clue is the hit's song title,
 * and the 3 falling answers are one correct (month, year) pair and two wrong pairs. Each wrong
 * pair has a wrong month, a wrong year (within 3 years of the real one), or both — never a pair
 * that happens to also be true for this hit.
 */
export function generateQuestion(allHits: Hit[]): Question {
  if (allHits.length < 3) {
    throw new Error("Need at least 3 hits in the dataset to generate a question with distractors.");
  }

  const hit = pickRandom(allHits);
  const correctMonth = pickRandom([...hit.months]);
  const correctYear = hit.year;

  const correct: AnswerOption = { month: correctMonth, year: correctYear, isCorrect: true };
  const wrong1 = buildWrongAnswer(hit, allHits, correctMonth, correctYear);

  let wrong2 = buildWrongAnswer(hit, allHits, correctMonth, correctYear);
  for (let attempt = 0; attempt < 20 && answersEqual(wrong1, wrong2); attempt++) {
    wrong2 = buildWrongAnswer(hit, allHits, correctMonth, correctYear);
  }

  return {
    category: hit.performer,
    clue: hit.title,
    answers: [correct, wrong1, wrong2],
  };
}
