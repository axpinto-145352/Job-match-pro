"use client";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const getScoreStyle = (s: number) => {
    if (s >= 80) return "score-excellent";
    if (s >= 60) return "score-good";
    if (s >= 40) return "score-fair";
    return "score-poor";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Excellent";
    if (s >= 60) return "Good";
    if (s >= 40) return "Fair";
    return "Low";
  };

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizeClasses[size]} ${getScoreStyle(score)} rounded-full flex items-center justify-center font-bold`}
        title={`AI Match Score: ${score}/100 - ${getScoreLabel(score)}`}
      >
        {score}
      </div>
      {size !== "sm" && (
        <span className={`text-xs ${getScoreStyle(score)} rounded-full px-2 py-0.5 font-medium`}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
