import { BONUS_PEAK_OFFSET, BONUS_POINTS, STACK_ROWS } from "../game/constants";
import type { ChartRow, Hit, PeakAnswer, Question } from "../types";

/** One-time rule text shown in the round-1 popup, naming the decade the player picked. */
export function buildSessionInstructions(decade: number): string {
  return (
    "The screens will display an artist and one year that the artist made the Billboard Top 100. " +
    "Tap the correct Song Title by that artist. " +
    "The blocks stack for each incorrect answer and the game ends when a block touches the stack " +
    `or when the stack reaches ${STACK_ROWS} high. Every 3 correct answers erases a row from the stack. ` +
    "Answer correctly and a bonus round pops up: pick the hit's real peak chart position from " +
    `3 choices for ${BONUS_POINTS} extra points. ` +
    `You picked the ${decade}s, so every artist, year, and answer choice will come from that decade.`
  );
}

/** Groups raw chart rows into one Hit per (performer, year, title), collecting every month it charted. */
export function buildHits(rows: ChartRow[]): Hit[] {
  const hitsByKey = new Map<string, Hit>();

  for (const row of rows) {
    const key = `${row.performer}::${row.year}::${row.title}`;
    let hit = hitsByKey.get(key);
    if (!hit) {
      hit = { performer: row.performer, year: row.year, title: row.title, months: new Set(), peakPosition: null };
      hitsByKey.set(key, hit);
    }
    hit.months.add(row.month);
    if (row.peakPosition !== null) {
      hit.peakPosition = hit.peakPosition === null ? row.peakPosition : Math.min(hit.peakPosition, row.peakPosition);
    }
  }

  return [...hitsByKey.values()];
}

const MIN_HITS_PER_DECADE = 3;

/** The decade (e.g. 1980) a given year falls into. */
export function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

/** Every decade with enough hits to generate a question, sorted oldest first. */
export function getAvailableDecades(allHits: Hit[]): number[] {
  const counts = new Map<number, number>();
  for (const hit of allHits) {
    const decade = decadeOf(hit.year);
    counts.set(decade, (counts.get(decade) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= MIN_HITS_PER_DECADE)
    .map(([decade]) => decade)
    .sort((a, b) => a - b);
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
 * Builds the 3 bonus answers for a hit's peak chart position: the real peak, plus 2 wrong
 * values nearby. The two wrong values are placed on randomly chosen sides of the real peak
 * (both below, both above, or one on each side) so the correct answer's numeric rank among
 * the three — lowest, middle, or highest — is unpredictable. Previously the wrong values
 * were always `peak - 5` and `peak + 5`, which made the real peak the numeric median (and
 * therefore guessable) in the vast majority of questions.
 */
function buildBonusAnswers(correctPeak: number): [PeakAnswer, PeakAnswer, PeakAnswer] {
  const wrongValues = new Set<number>();
  const tryAdd = (value: number) => {
    if (value >= 1 && value !== correctPeak && !wrongValues.has(value)) {
      wrongValues.add(value);
      return true;
    }
    return false;
  };

  // Each wrong value prefers a randomly chosen side of the real peak; if that side would go
  // below 1 (or collide), it falls back to the opposite side instead.
  const addOnSide = (magnitude: number, preferBelow: boolean) => {
    const primary = preferBelow ? correctPeak - magnitude : correctPeak + magnitude;
    if (tryAdd(primary)) return;
    tryAdd(preferBelow ? correctPeak + magnitude : correctPeak - magnitude);
  };

  const pattern = randomInt(3); // 0: both below, 1: both above, 2: one on each side
  const [firstBelow, secondBelow] = pattern === 0 ? [true, true] : pattern === 1 ? [false, false] : [true, false];

  addOnSide(BONUS_PEAK_OFFSET, firstBelow);
  addOnSide(BONUS_PEAK_OFFSET * 2, secondBelow);

  let extraOffset = BONUS_PEAK_OFFSET * 3;
  while (wrongValues.size < 2) {
    tryAdd(correctPeak + extraOffset) || tryAdd(correctPeak - extraOffset);
    extraOffset += BONUS_PEAK_OFFSET;
  }

  const [wrongA, wrongB] = [...wrongValues].slice(0, 2);
  return [
    { peakPosition: correctPeak, isCorrect: true },
    { peakPosition: wrongA, isCorrect: false },
    { peakPosition: wrongB, isCorrect: false },
  ];
}

/**
 * Picks a random hit and builds a title question for it: the performer and year are shown
 * in the ribbon, and the 3 falling answers are the hit's real title plus 2 other real song
 * titles pulled from elsewhere in the dataset. Also builds bonus peak-position answers when
 * the hit has usable peak-position data.
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
    bonusAnswers: hit.peakPosition !== null ? buildBonusAnswers(hit.peakPosition) : null,
  };
}
