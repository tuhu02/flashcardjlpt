"use client";

import { clsx } from "@/lib/clsx";
import { getModeLabel, type QuizQuestion } from "@/lib/quiz";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type QuizCardProps = {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  showFeedback: boolean;
  onSelect: (answer: string) => void;
  onNext: () => void;
  onSkip: () => void;
};

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  showFeedback,
  onSelect,
  onNext,
  onSkip,
}: QuizCardProps) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <Card className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-stone-500">
          <span>{getModeLabel(question.mode)}</span>
          <span>
            {questionNumber} / {totalQuestions}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-red-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-8 text-center">
        {question.promptType === "kanji" ? (
          <p className="font-jp text-7xl font-bold text-stone-900 sm:text-8xl">
            {question.prompt}
          </p>
        ) : (
          <p className="text-2xl font-semibold text-stone-800 sm:text-3xl">
            {question.prompt}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === question.correctAnswer;
          let stateClass = "border-stone-200 hover:border-red-300 hover:bg-red-50";

          if (showFeedback && isCorrect) {
            stateClass = "border-emerald-500 bg-emerald-50 text-emerald-900";
          } else if (showFeedback && isSelected && !isCorrect) {
            stateClass = "border-red-500 bg-red-50 text-red-900";
          } else if (isSelected) {
            stateClass = "border-red-400 bg-red-50";
          }

          return (
            <button
              key={option}
              type="button"
              disabled={showFeedback}
              onClick={() => onSelect(option)}
              className={clsx(
                "rounded-xl border-2 px-4 py-4 text-left text-base font-medium transition-all duration-150",
                question.promptType === "meaning" && "font-jp text-3xl text-center",
                stateClass,
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {showFeedback && selectedAnswer !== question.correctAnswer ? (
        <p className="mt-4 text-center text-sm text-stone-600">
          Jawaban benar:{" "}
          <strong className="font-jp text-base">{question.correctAnswer}</strong>
        </p>
      ) : null}

      <div className="mt-6 flex justify-between gap-3">
        <Button variant="ghost" onClick={onSkip} disabled={showFeedback}>
          Lewati
        </Button>
        <Button onClick={onNext} disabled={!showFeedback}>
          {questionNumber === totalQuestions ? "Selesai" : "Lanjut"}
        </Button>
      </div>
    </Card>
  );
}
