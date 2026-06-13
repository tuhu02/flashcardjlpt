import type { QuizMode } from "./validations";

export type KanjiItem = {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
  category?: string | null;
  example?: string | null;
};

export type QuizQuestion = {
  kanjiId: string;
  mode: QuizMode;
  prompt: string;
  promptType: "kanji" | "meaning";
  correctAnswer: string;
  options: string[];
};

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickDistractors(
  pool: string[],
  correct: string,
  count: number,
): string[] {
  const unique = [...new Set(pool.filter((item) => item !== correct))];
  return shuffleArray(unique).slice(0, count);
}

function buildOptions(correct: string, distractors: string[]): string[] {
  const options = shuffleArray([correct, ...distractors.slice(0, 3)]);
  while (options.length < 4) {
    options.push(`— ${options.length}`);
  }
  return options.slice(0, 4);
}

export function generateQuizQuestions(
  kanjis: KanjiItem[],
  modes: QuizMode[],
  questionCount: number | "all",
  shuffle: boolean,
): QuizQuestion[] {
  if (kanjis.length === 0 || modes.length === 0) {
    return [];
  }

  const pool = shuffle ? shuffleArray(kanjis) : [...kanjis];
  const limit =
    questionCount === "all" ? pool.length : Math.min(questionCount, pool.length);
  const selected = pool.slice(0, limit);

  const meanings = kanjis.map((k) => k.meaning);
  const readings = kanjis.map((k) => k.reading);
  const kanjiChars = kanjis.map((k) => k.kanji);

  const questions: QuizQuestion[] = selected.map((item, index) => {
    const mode = modes[index % modes.length];

    if (mode === "kanji-to-meaning") {
      const distractors = pickDistractors(meanings, item.meaning, 3);
      return {
        kanjiId: item.id,
        mode,
        prompt: item.kanji,
        promptType: "kanji",
        correctAnswer: item.meaning,
        options: buildOptions(item.meaning, distractors),
      };
    }

    if (mode === "kanji-to-reading") {
      const distractors = pickDistractors(readings, item.reading, 3);
      return {
        kanjiId: item.id,
        mode,
        prompt: item.kanji,
        promptType: "kanji",
        correctAnswer: item.reading,
        options: buildOptions(item.reading, distractors),
      };
    }

    const distractors = pickDistractors(kanjiChars, item.kanji, 3);
    return {
      kanjiId: item.id,
      mode,
      prompt: item.meaning,
      promptType: "meaning",
      correctAnswer: item.kanji,
      options: buildOptions(item.kanji, distractors),
    };
  });

  return shuffle ? shuffleArray(questions) : questions;
}

export function getModeLabel(mode: QuizMode): string {
  switch (mode) {
    case "kanji-to-meaning":
      return "Kanji → Arti";
    case "kanji-to-reading":
      return "Kanji → Cara Baca";
    case "meaning-to-kanji":
      return "Arti → Kanji";
  }
}

export function calculateKanjiStatus(
  totalAttempts: number,
  correctAttempts: number,
): string {
  if (totalAttempts === 0) {
    return "Baru";
  }

  const accuracy = correctAttempts / totalAttempts;

  if (accuracy >= 0.85 && totalAttempts >= 5) {
    return "Hafal";
  }
  if (accuracy < 0.5 && totalAttempts >= 3) {
    return "Perlu Diulang";
  }
  if (totalAttempts >= 1) {
    return "Sedang Dipelajari";
  }

  return "Baru";
}

export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) {
    return 0;
  }

  const uniqueDays = [
    ...new Set(
      dates.map((d) => {
        const date = new Date(d);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      }),
    ),
  ].sort((a, b) => b.localeCompare(a));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const key = `${expected.getFullYear()}-${expected.getMonth()}-${expected.getDate()}`;

    if (uniqueDays.includes(key)) {
      streak++;
    } else if (i === 0) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
      if (uniqueDays.includes(yesterdayKey)) {
        streak++;
        continue;
      }
      break;
    } else {
      break;
    }
  }

  return streak;
}
