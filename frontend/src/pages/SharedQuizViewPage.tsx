import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { sharingAPI } from '../services/api';
import { LoadingSpinner } from '../components/Common';
import Layout from '../components/Layout';
import { useState } from 'react';
import { ArrowLeft, Copy, Check, AlertCircle } from 'lucide-react';

export default function SharedQuizViewPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const { data: sharedSet, isLoading, error } = useQuery({
    queryKey: ['shared-quiz', shareToken],
    queryFn: async () => {
      console.log('[SHARED] Fetching quiz with token:', shareToken);
      try {
        const response = await sharingAPI.getQuizSet(shareToken!);
        console.log('[SHARED] Response:', response);
        const data = response.data?.data || response.data;
        console.log('[SHARED] Data:', data);
        setDebugInfo(JSON.stringify(data, null, 2));
        return data;
      } catch (err) {
        console.error('[SHARED] Error:', err);
        setDebugInfo(JSON.stringify(err, null, 2));
        throw err;
      }
    },
    enabled: !!shareToken,
  });

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  if (error) {
    return (
      <Layout>
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900 border border-red-800 rounded-xl p-12">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Error Loading Quiz</h2>
              <p className="text-slate-400 mb-6">
                {error instanceof Error ? error.message : 'The quiz set you\'re looking for doesn\'t exist or is not shared publicly.'}
              </p>
              {debugInfo && (
                <pre className="bg-slate-800 p-4 rounded text-xs text-red-300 mb-4 max-h-40 overflow-auto">
                  {debugInfo}
                </pre>
              )}
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

  if (!sharedSet) {
    return (
      <Layout>
        <div className="p-8">
          <div className="max-w-md mx-auto">
            <div className="bg-slate-900 border border-red-800 rounded-xl p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Data</h2>
              <p className="text-slate-400 mb-6">
                No quiz set data received from server.
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

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-6 h-6 text-slate-400" />
            </button>
            <div className="min-w-0">
              <h1 className="text-4xl font-bold text-white mb-2">{sharedSet.title}</h1>
              {sharedSet.creator && (
                <p className="text-slate-400">
                  Shared by {sharedSet.creator.name} ({sharedSet.creator.email})
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Link
              </>
            )}
          </button>
        </div>

        {/* Description */}
        {sharedSet.description && (
          <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-lg">
            <p className="text-slate-300">{sharedSet.description}</p>
          </div>
        )}

        {/* Quizzes List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4">
            Quizzes ({sharedSet.quizzes?.length || 0})
          </h2>

          {sharedSet.quizzes && sharedSet.quizzes.length > 0 ? (
            <div className="space-y-4">
              {sharedSet.quizzes.map((item: any, idx: number) => (
                <div key={item.id || idx} className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-blue-600/50 transition-all">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-400 font-semibold mb-2">Score</p>
                      <p className="text-2xl font-bold text-white">
                        {item.quiz?.score || 0}/{item.quiz?.total || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 font-semibold mb-2">Percentage</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {item.quiz?.total ? Math.round((item.quiz.score / item.quiz.total) * 100) : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 font-semibold mb-2">Status</p>
                      <p className="text-lg text-slate-300">Completed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-lg">
              <p className="text-slate-400">No quizzes available</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
