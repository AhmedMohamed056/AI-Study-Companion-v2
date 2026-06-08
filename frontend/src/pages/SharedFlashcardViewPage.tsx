import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { sharingAPI } from '../services/api';
import { LoadingSpinner } from '../components/Common';
import Layout from '../components/Layout';
import { useState } from 'react';
import { ArrowLeft, Copy, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SharedFlashcardViewPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const { data: sharedSet, isLoading, error } = useQuery({
    queryKey: ['shared-flashcard', shareToken],
    queryFn: async () => {
      const response = await sharingAPI.getFlashcardSet(shareToken!);
      return response.data?.data || response.data;
    },
    enabled: !!shareToken,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goTo = (idx: number) => {
    setCurrentIndex(idx);
    setIsFlipped(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !sharedSet) {
    return (
      <Layout>
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900 border border-red-800 rounded-xl p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Error Loading Flashcards</h2>
              <p className="text-slate-400 mb-6">
                {error instanceof Error ? error.message : 'This flashcard set does not exist or is not accessible.'}
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const cards: { flashcard: { front: string; back: string } }[] = sharedSet.flashcards || [];
  const total = cards.length;
  const currentCard = cards[currentIndex]?.flashcard;

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-6 h-6 text-slate-400" />
            </button>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-white truncate">{sharedSet.title}</h1>
              {sharedSet.creator && (
                <p className="text-slate-400 text-sm mt-1">Shared by {sharedSet.creator.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex-shrink-0"
          >
            {copied ? <><Check className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy Link</>}
          </button>
        </div>

        {sharedSet.description && (
          <div className="mb-6 p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <p className="text-slate-300">{sharedSet.description}</p>
          </div>
        )}

        {total === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-lg">
            <p className="text-slate-400">No flashcards in this set.</p>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Card {currentIndex + 1} of {total}</span>
                <span>{Math.round(((currentIndex + 1) / total) * 100)}% complete</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                />
              </div>
            </div>

            {/* Flip card */}
            <div className="flex justify-center mb-8">
              <div
                onClick={() => setIsFlipped((f) => !f)}
                className="w-full h-80 cursor-pointer"
                style={{ perspective: '1000px' }}
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
                    <p className="text-slate-300 text-sm mb-4 uppercase tracking-widest">Question</p>
                    <p className="text-white text-2xl font-bold text-center leading-relaxed">
                      {currentCard?.front}
                    </p>
                    <p className="text-slate-300/70 text-sm mt-8">Click to reveal answer</p>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <p className="text-slate-300 text-sm mb-4 uppercase tracking-widest">Answer</p>
                    <p className="text-white text-2xl font-bold text-center leading-relaxed">
                      {currentCard?.back}
                    </p>
                    <p className="text-slate-300/70 text-sm mt-8">Click to see question</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <button
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
              <button
                onClick={() => setIsFlipped((f) => !f)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-all"
              >
                Flip Card
              </button>
              <button
                onClick={() => goTo(currentIndex + 1)}
                disabled={currentIndex === total - 1}
                className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Card dots */}
            <div className="flex flex-wrap justify-center gap-2">
              {cards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-purple-500 scale-125'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
