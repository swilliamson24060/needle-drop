import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const SCORES_COLLECTION = "scores";
const TOP_N = 40;
const PLAYER_NAME_KEY = "needleDropPlayerName";
const MAX_NAME_LENGTH = 20;

export interface LeaderboardEntry {
  name: string;
  score: number;
  decade: number;
}

/** Returns the player's saved name, prompting once and remembering it for next time. */
export function getOrPromptPlayerName(): string {
  const saved = window.localStorage.getItem(PLAYER_NAME_KEY);
  if (saved) return saved;

  let entered: string | null = null;
  try {
    entered = window.prompt("Enter your name for the leaderboard:", "");
  } catch {
    // window.prompt isn't available in every environment (e.g. some embedded webviews) — fall back below.
  }
  const trimmed = entered?.trim().slice(0, MAX_NAME_LENGTH);
  const name = trimmed && trimmed.length > 0 ? trimmed : "Anonymous";
  window.localStorage.setItem(PLAYER_NAME_KEY, name);
  return name;
}

/** Records a completed game's score. Fire-and-forget from the caller's perspective. */
export async function submitScore(name: string, score: number, decade: number): Promise<void> {
  await addDoc(collection(db, SCORES_COLLECTION), {
    name,
    score,
    decade,
    createdAt: serverTimestamp(),
  });
}

/** Fetches the top 40 scores, highest first. */
export async function fetchTopScores(): Promise<LeaderboardEntry[]> {
  const q = query(collection(db, SCORES_COLLECTION), orderBy("score", "desc"), limit(TOP_N));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as LeaderboardEntry);
}
