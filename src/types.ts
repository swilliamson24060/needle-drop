export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export type MonthName = typeof MONTH_NAMES[number];

/** One row of the source chart CSV, trimmed to the fields the game uses. */
export interface ChartRow {
  year: number;
  month: MonthName;
  title: string;
  performer: string;
  /** That week's peak chart position, or null if the CSV didn't have a usable value. */
  peakPosition: number | null;
}

/** A specific song by a specific performer in a specific year, with every month it charted. */
export interface Hit {
  performer: string;
  year: number;
  title: string;
  months: Set<MonthName>;
  /** Best (lowest) peak position seen across this hit's chart weeks, or null if unavailable. */
  peakPosition: number | null;
}

/** One falling block's answer: a candidate song title, and whether it's the real one. */
export interface TitleAnswer {
  title: string;
  isCorrect: boolean;
}

/** One bonus block's answer: a candidate peak chart position, and whether it's the real one. */
export interface PeakAnswer {
  peakPosition: number;
  isCorrect: boolean;
}

export interface Question {
  category: string; // performer
  subcategory: string; // year
  answers: [TitleAnswer, TitleAnswer, TitleAnswer];
  /** Set only when this hit has a usable peak position, enabling a bonus round. */
  bonusAnswers: [PeakAnswer, PeakAnswer, PeakAnswer] | null;
}
