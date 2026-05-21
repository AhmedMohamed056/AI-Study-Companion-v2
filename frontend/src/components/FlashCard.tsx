import { useState } from 'react';

interface FlashcardProps {
  front: string;
  back: string;
  onReview?: (ease: 'easy' | 'hard' | 'again') => void;
}

export const FlashCard = ({ front, back, onReview }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="h-64 w-full max-w-md cursor-pointer rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white shadow-lg transition-transform hover:scale-105"
      >
        <div className="flex h-full items-center justify-center text-center">
          <div>
            <p className="mb-4 text-sm font-semibold opacity-75">{isFlipped ? 'Answer' : 'Question'}</p>
            <p className="text-2xl font-bold">{isFlipped ? back : front}</p>
          </div>
        </div>
      </div>

      {onReview && (
        <div className="flex gap-4">
          <button
            onClick={() => onReview('again')}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Again
          </button>
          <button
            onClick={() => onReview('hard')}
            className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
          >
            Hard
          </button>
          <button
            onClick={() => onReview('easy')}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Easy
          </button>
        </div>
      )}
    </div>
  );
};
