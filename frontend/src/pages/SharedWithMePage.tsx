import React, { useState, useEffect } from 'react';
import { Eye, Copy, AlertCircle } from 'lucide-react';
import { sharingAPI } from '../services/api';
import { LoadingSpinner } from '../components/Common';
import Layout from '../components/Layout';

interface SharedFlashcardSet {
  id: string;
  title: string;
  description?: string;
  creator: { name: string; email: string };
  flashcards: any[];
  createdAt: string;
  shareToken: string;
}

interface SharedQuizSet {
  id: string;
  title: string;
  description?: string;
  creator: { name: string; email: string };
  quizzes: any[];
  createdAt: string;
  shareToken: string;
}

export const SharedWithMePage: React.FC = () => {
  const [flashcardSets, setFlashcardSets] = useState<SharedFlashcardSet[]>([]);
  const [quizSets, setQuizSets] = useState<SharedQuizSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quizzes'>('flashcards');

  useEffect(() => {
    fetchSharedContent();
  }, []);

  const fetchSharedContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const [flashRes, quizRes] = await Promise.all([
        sharingAPI.getSharedFlashcardsWithMe(),
        sharingAPI.getSharedQuizzesWithMe(),
      ]);

      // Normalize responses: handle both { data: [...] } and direct array
      const flashcardData = Array.isArray(flashRes?.data?.data)
        ? flashRes.data.data
        : Array.isArray(flashRes?.data)
        ? flashRes.data
        : [];

      const quizData = Array.isArray(quizRes?.data?.data)
        ? quizRes.data.data
        : Array.isArray(quizRes?.data)
        ? quizRes.data
        : [];

      setFlashcardSets(flashcardData);
      setQuizSets(quizData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load shared content');
      setFlashcardSets([]);
      setQuizSets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (setId: string, type: 'flashcard' | 'quiz') => {
    try {
      const api = type === 'flashcard' ? sharingAPI.duplicateFlashcardSet : sharingAPI.duplicateQuizSet;
      const response = await api(setId);

      const duplicatedCount = response?.data?.duplicatedCount || response?.data?.data?.duplicatedCount || 1;
      alert(
        `Successfully duplicated ${duplicatedCount} ${type === 'flashcard' ? 'flashcards' : 'quizzes'} to your library!`
      );
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to duplicate');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Shared with Me</h1>
            <p className="text-slate-400">View and copy content shared by classmates</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'flashcards'
                  ? 'border-purple-600 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Flashcard Sets ({flashcardSets.length})
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'quizzes'
                  ? 'border-purple-600 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Quiz Sets ({quizSets.length})
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'flashcards' ? (
              <>
                {flashcardSets.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-lg">No flashcard sets shared with you yet</p>
                  </div>
                ) : (
                  flashcardSets.map((set) => (
                    <div
                      key={set.id}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-purple-600/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white mb-1">{set.title}</h3>
                          {set.description && (
                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{set.description}</p>
                          )}
                          <div className="space-y-2 text-sm text-slate-400">
                            <p>
                              Shared by <span className="font-medium text-slate-300">{set.creator.name}</span>
                            </p>
                            <p>
                              <span className="font-medium text-slate-300">{set.flashcards.length}</span> flashcards
                            </p>
                            <p>Shared on {formatDate(set.createdAt)}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              window.location.href = `/shared/flashcard/${set.shareToken}`;
                            }}
                            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleDuplicate(set.id, 'flashcard')}
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Copy to Library
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <>
                {quizSets.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-lg">No quiz sets shared with you yet</p>
                  </div>
                ) : (
                  quizSets.map((set) => (
                    <div
                      key={set.id}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-purple-600/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white mb-1">{set.title}</h3>
                          {set.description && (
                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{set.description}</p>
                          )}
                          <div className="space-y-2 text-sm text-slate-400">
                            <p>
                              Shared by <span className="font-medium text-slate-300">{set.creator.name}</span>
                            </p>
                            <p>
                              <span className="font-medium text-slate-300">{set.quizzes.length}</span> quizzes
                            </p>
                            <p>Shared on {formatDate(set.createdAt)}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              window.location.href = `/shared/quiz/${set.shareToken}`;
                            }}
                            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleDuplicate(set.id, 'quiz')}
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Copy to Library
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SharedWithMePage;
