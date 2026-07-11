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
}

/** A specific song by a specific performer in a specific year, with every month it charted. */
export interface Hit {
  performer: string;
  year: number;
  title: string;
  months: Set<MonthName>;
}

/** One falling block's answer: a month+year pair, and whether it's the actual charted month/year. */
export interface AnswerOption {
  month: MonthName;
  year: number;
  isCorrect: boolean;
}

export interface Question {
  category: string; // performer
  clue: string; // song title
  answers: [AnswerOption, AnswerOption, AnswerOption];
}
