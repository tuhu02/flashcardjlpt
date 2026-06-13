"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { QuizCard } from "@/components/quiz/quiz-card";
import type { QuizQuestion } from "@/lib/quiz";

type QuizSessionData = {
  collectionId: string;
  collectionName: string;
  questions: QuizQuestion[];
};

type AnswerRecord = {
  kanjiId: string;
  isCorrect: boolean;
  skipped: boolean;
  timeTaken: number;
};

export default function QuizSessionPage() {
  const router = useRouter();
  const [session, setSession] = useState<QuizSessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const answersRef = useRef<AnswerRecord[]>([]);
  const [questionStart, setQuestionStart] = useState(Date.now());
  const [sessionStart] = useState(Date.now());

  useEffect(() => {
    const raw = sessionStorage.getItem("quizSession");
    if (!raw) {
      router.replace("/quiz/setup");
      return;
    }
    setSession(JSON.parse(raw));
  }, [router]);

  const question = session?.questions[currentIndex];

  const recordAnswer = useCallback(
    (isCorrect: boolean, skipped: boolean) => {
      if (!question) return;

      const timeTaken = Math.round((Date.now() - questionStart) / 1000);
      const record: AnswerRecord = {
        kanjiId: question.kanjiId,
        isCorrect,
        skipped,
        timeTaken,
      };
      answersRef.current = [...answersRef.current, record];
    },
    [question, questionStart],
  );

  function handleSelect(answer: string) {
    if (!question || showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    recordAnswer(answer === question.correctAnswer, false);
  }

  function handleSkip() {
    if (!question || showFeedback) return;
    setSelectedAnswer(null);
    setShowFeedback(true);
    recordAnswer(false, true);
  }

  async function handleNext() {
    if (!session || !question) return;

    if (currentIndex + 1 >= session.questions.length) {
      const duration = Math.round((Date.now() - sessionStart) / 1000);
      const primaryMode = session.questions[0]?.mode ?? "kanji-to-meaning";

      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          collectionId: session.collectionId,
          mode: primaryMode,
          duration,
          results: answersRef.current,
        }),
      });

      const result = await res.json();
      sessionStorage.removeItem("quizSession");
      sessionStorage.setItem("quizResult", JSON.stringify(result));
      router.push("/quiz/result");
      return;
    }

    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setQuestionStart(Date.now());
  }

  if (!session || !question) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-500">Memuat kuis...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="mx-auto mb-6 max-w-2xl text-center">
        <p className="text-sm text-stone-500">{session.collectionName}</p>
      </div>
      <QuizCard
        question={question}
        questionNumber={currentIndex + 1}
        totalQuestions={session.questions.length}
        selectedAnswer={selectedAnswer}
        showFeedback={showFeedback}
        onSelect={handleSelect}
        onNext={handleNext}
        onSkip={handleSkip}
      />
    </div>
  );
}
