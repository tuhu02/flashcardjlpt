import { z } from "zod";

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

export const QUIZ_MODES = [
  "kanji-to-meaning",
  "kanji-to-reading",
  "meaning-to-kanji",
] as const;

export type QuizMode = (typeof QUIZ_MODES)[number];

export const KANJI_STATUSES = [
  "Baru",
  "Sedang Dipelajari",
  "Hafal",
  "Perlu Diulang",
] as const;

export const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const collectionSchema = z.object({
  name: z.string().min(1, "Nama koleksi wajib diisi"),
  description: z.string().optional(),
  jlptLevel: z.enum(JLPT_LEVELS).optional().or(z.literal("")),
});

export const kanjiSchema = z.object({
  kanji: z.string().min(1, "Kanji wajib diisi"),
  reading: z.string().min(1, "Cara baca wajib diisi"),
  meaning: z.string().min(1, "Arti wajib diisi"),
  category: z.string().optional(),
  example: z.string().optional(),
  collectionId: z.string().min(1),
});

export const quizSetupSchema = z.object({
  collectionId: z.string().min(1),
  modes: z.array(z.enum(QUIZ_MODES)).min(1),
  questionCount: z.union([z.literal(10), z.literal(20), z.literal("all")]),
  shuffle: z.boolean().default(true),
});

export const quizSubmitSchema = z.object({
  collectionId: z.string().min(1),
  mode: z.enum(QUIZ_MODES),
  duration: z.number().int().min(0),
  results: z.array(
    z.object({
      kanjiId: z.string(),
      isCorrect: z.boolean(),
      skipped: z.boolean().default(false),
      timeTaken: z.number().int().min(0),
    }),
  ),
});

export const NOTE_CATEGORIES = [
  "Kalimat",
  "Partikel",
  "Kanji",
  "Tata Bahasa",
  "Umum",
] as const;

export const noteSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  content: z.string().min(1, "Konten wajib diisi"),
  explanation: z.string().min(1, "Penjelasan wajib diisi"),
  category: z.enum(NOTE_CATEGORIES).default("Umum"),
});

export type KanjiInput = z.infer<typeof kanjiSchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
export type QuizSetupInput = z.infer<typeof quizSetupSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
