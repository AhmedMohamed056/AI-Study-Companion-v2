import { useQuery, useMutation } from '@tanstack/react-query';
import { flashcardService } from '../services';
import { LoadingSpinner } from '../components/Common';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { RotateCw, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function FlashcardReviewPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const { data: flashcardsResponse, isLoading, error: flashcardsError } = useQuery({
    queryKey: ['flashcards', 'due'],
    queryFn: () => flashcardService.getDueFlashcards(),
  });

  useEffect(() => {
    if (flashcardsError) {
      console.error('[FLASHCARDS] Error fetching due flashcards:', flashcardsError);
      console.error('[FLASHCARDS] Error details:', (flashcardsError as any).response?.data);
    }
  }, [flashcardsError]);

  const flashcards = flashcardsResponse?.data || [];

  // Log empty array for debugging
  useEffect(() => {
    if (flashcards.length === 0 && !isLoading) {
      console.log('[FLASHCARDS] No flashcards returned. Full response:', JSON.stringify(flashcardsResponse, null, 2));
    }
  }, [flashcards, isLoading, flashcardsResponse]);

  const reviewMutation = useMutation({
    mutationFn: (ease: 'easy' | 'hard' | 'again') =>
      flashcardService.reviewFlashcard(flashcards[currentIndex]?.id, ease),
    onSuccess: () => {
      setReviewed(reviewed + 1);
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        navigate('/dashboard');
      }
    },
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      }
      if (e.key === '1') reviewMutation.mutate('easy');
      if (e.key === '2') reviewMutation.mutate('hard');
      if (e.key === '3') reviewMutation.mutate('again');
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, currentIndex, flashcards, reviewMutation]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <Layout>
        <div className="p-8">
          <div className="max-w-md mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCw className="w-8 h-8 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Flashcards Yet</h2>
              <p className="text-slate-400 mb-6">Generate flashcards from a lecture to start reviewing</p>
              <button
                onClick={() => navigate('/courses')}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                Go to Courses
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((reviewed + 1) / flashcards.length) * 100;

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold text-white">Flashcard Review</h1>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Card {currentIndex + 1} of {flashcards.length}</p>
            <p className="text-white font-semibold">{reviewed} reviewed</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-slate-400 text-sm mt-2">{Math.round(progress)}% complete</p>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-12">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-2xl h-96 cursor-pointer perspective"
            style={{
              perspective: '1000px',
            }}
          >
            <div
              className="relative w-full h-full transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front */}
              <div
                className="absolute w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <p className="text-slate-300 text-sm mb-4">Question</p>
                <p className="text-white text-3xl font-bold text-center">{currentCard.front}</p>
                <p className="text-slate-200 text-sm mt-8">Click to reveal answer</p>
              </div>

              {/* Back */}
              <div
                className="absolute w-full h-full bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <p className="text-slate-300 text-sm mb-4">Answer</p>
                <p className="text-white text-3xl font-bold text-center">{currentCard.back}</p>
                <p className="text-slate-200 text-sm mt-8">Click to see question</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Buttons */}
        <div className="max-w-2xl mx-auto">
          <p className="text-slate-400 text-center mb-4 text-sm">How well did you know this?</p>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => reviewMutation.mutate('again')}
              disabled={reviewMutation.isPending}
              className="py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-5 h-5" />
              <span>Again (3)</span>
            </button>

            <button
              onClick={() => reviewMutation.mutate('hard')}
              disabled={reviewMutation.isPending}
              className="py-4 px-6 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw className="w-5 h-5" />
              <span>Hard (2)</span>
            </button>

            <button
              onClick={() => reviewMutation.mutate('easy')}
              disabled={reviewMutation.isPending}
              className="py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Easy (1)</span>
            </button>
          </div>

          <p className="text-slate-500 text-center text-xs mt-4">
            Keyboard shortcuts: Space to flip, 1/2/3 for Easy/Hard/Again
          </p>
        </div>
      </div>
    </Layout>
  );
}
