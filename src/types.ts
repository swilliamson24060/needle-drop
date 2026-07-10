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

export interface Question {
  category: string; // performer
  subcategory: string; // year
  clue: string; // song title
  correctAnswer: string; // month
  wrongAnswers: [string, string]; // months
}
