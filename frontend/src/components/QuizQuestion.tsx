interface QuizQuestionProps {
  question: string;
  options: string[];
  selectedAnswer?: string;
  onSelectAnswer: (answer: string) => void;
  showCorrect?: boolean;
  correctAnswer?: string;
}

export const QuizQuestion = ({
  question,
  options,
  selectedAnswer,
  onSelectAnswer,
  showCorrect,
  correctAnswer,
}: QuizQuestionProps) => {
  return (
    <div className="space-y-4">
      {/* Only render question if showCorrect is true (for results page) */}
      {showCorrect && (
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{question}</h3>
      )}

      <div className="space-y-3">
        {options.map((option, index) => {
          const letter = String.fromCharCode(65 + index); // A, B, C, D
          const isSelected = selectedAnswer === letter;
          const isCorrect = showCorrect && correctAnswer === letter;
          const isWrong = showCorrect && isSelected && correctAnswer !== letter;

          return (
            <button
              key={index}
              onClick={() => !showCorrect && onSelectAnswer(letter)}
              disabled={showCorrect}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all font-medium ${
                isCorrect
                  ? 'border-green-500 bg-green-50 text-slate-900'
                  : isWrong
                    ? 'border-red-500 bg-red-50 text-slate-900'
                    : isSelected
                      ? 'border-blue-500 bg-blue-50 text-slate-900'
                      : 'border-slate-300 bg-white text-slate-900 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <span className="font-bold text-blue-600">{letter}.</span> {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};
