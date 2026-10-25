import React from "react";
import { Skeleton } from "./ui/skeleton";
import { QuestionType } from "../types/QuestionType";
import AiAvatar from "./AiAvatar";

interface QuestionDisplayProps {
  question?: QuestionType;
  loading: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  loading,
}) => {
  if (question) {
    return (
      <div key={question.id} className="flex animate-fade-up items-start gap-3">
        <AiAvatar />
        <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-muted/60 px-4 py-3 sm:px-5 sm:py-4">
          <p className="eyebrow mb-1.5">Interviewer</p>
          <p className="text-[15px] leading-relaxed sm:text-base">
            {question.question}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return null;
};

export default QuestionDisplay;
