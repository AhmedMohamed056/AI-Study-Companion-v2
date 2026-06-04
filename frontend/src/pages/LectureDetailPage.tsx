import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lectureService, flashcardService, quizService, noteService } from '../services';
import { sharingAPI } from '../services/api';
import { useAuthStore } from '../store/auth';
import { LoadingSpinner } from '../components/Common';
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, BookOpen, Brain, CheckCircle, AlertCircle, Trash2, Edit2, RotateCw, Share2 } from 'lucide-react';
import { ShareModal } from '../components/ShareModal';

type SummaryData = {
  title: string;
  keyTopics?: string[];
  summary: string;
  importantTerms?: { term: string; definition: string }[];
};

export default function LectureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [flashcardsCount, setFlashcardsCount] = useState(0);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedFlashcardSet, setSharedFlashcardSet] = useState<any>(null);
  const [sharedQuizSet, setSharedQuizSet] = useState<any>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareType, setShareType] = useState<'flashcard' | 'quiz'>('flashcard');

  const { data: lecture, isLoading } = useQuery({
    queryKey: ['lecture', id],
    queryFn: () => lectureService.getLecture(id!),
    select: (response) => {
      // Handle both { data: {...} } and {...} response formats
      return Array.isArray(response.data) ? response.data[0] : (response.data?.data || response.data);
    },
  });

  const { data: notesData } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => noteService.getNotes(id!),
    enabled: !!id,
    select: (response) => {
      // React Query passes the full axios response, so we need response.data
      const data = response.data;
      // Handle both { data: [...] } and [...] response formats
      const normalized = Array.isArray(data) ? data : (data?.data || []);
      return normalized;
    },
  });

  // Helper function to parse and validate summary
  const parseSummaryData = (data: any): SummaryData | null => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;

      if (!parsed?.title || !parsed?.summary) {
        return null;
      }

      // Skip error states
      if (parsed.title.includes('Unable to generate')) {
        return null;
      }

      return {
        title: parsed.title || '',
        summary: typeof parsed.summary === 'string'
          ? parsed.summary
          : JSON.stringify(parsed.summary),
        keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [],
        importantTerms: Array.isArray(parsed.importantTerms) ? parsed.importantTerms : [],
      };
    } catch (error) {
      console.error('[SUMMARY] Error parsing summary data:', error);
      return null;
    }
  };

  // Load existing summary from lecture data when lecture is loaded
  useEffect(() => {
    if (lecture) {
      if (lecture?.summary) {
        const parsedSummary = parseSummaryData(lecture.summary);
        if (parsedSummary) {
          setSummary(parsedSummary);
          setSummaryError(null);
          console.log('[SUMMARY] Loaded existing summary from lecture data');
        }
      }
    }
  }, [lecture]);

  const summaryMutation = useMutation({
    mutationFn: () => lectureService.getSummary(id!),
    onSuccess: (response) => {
      console.log('[SUMMARY] API Response received:', response.status);
      console.log('[SUMMARY] Response data:', JSON.stringify(response.data));

      let summaryData = response.data;

      // Unwrap nested data objects
      while (summaryData?.data && typeof summaryData.data === 'object' && !summaryData?.summary) {
        summaryData = summaryData.data;
      }

      console.log('[SUMMARY] Unwrapped data:', JSON.stringify(summaryData));

      const parsedSummary = parseSummaryData(summaryData);

      if (parsedSummary) {
        setSummary(parsedSummary);
        setSummaryError(null);

        // Update React Query cache with new summary
        queryClient.setQueryData(['lecture', id], (oldData: any) => {
          if (!oldData) return oldData;

          const updated = { ...oldData };

          if (updated.data.data) {
            updated.data.data.summary = JSON.stringify(parsedSummary);
          } else {
            updated.data.summary = JSON.stringify(parsedSummary);
          }

          return updated;
        });

        setToast({ type: 'success', message: 'Summary generated successfully!' });
        console.log('[SUMMARY] Summary state updated and cache invalidated');
      } else {
        console.error('[SUMMARY] Failed to parse summary response:', summaryData);
        setSummaryError('Failed to parse summary response');
        setToast({ type: 'error', message: 'Failed to parse summary response' });
      }

      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      console.error('[SUMMARY] API Error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to generate summary';
      setSummaryError(errorMessage);
      setToast({ type: 'error', message: errorMessage });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const generateFlashcardsMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('Lecture ID is required');
      return flashcardService.generateFlashcards(id);
    },
    onSuccess: (response) => {
      console.log('[FLASHCARDS] Response:', response);
      const count = response.data.data?.length || 0;
      setFlashcardsCount(count);
      setToast({ type: 'success', message: `${count} flashcards generated!` });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      console.error('[FLASHCARDS] Error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to generate flashcards';
      setToast({ type: 'error', message: errorMessage });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const generateQuizMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('Lecture ID is required');
      console.log('[QUIZ] Generating quiz for lecture:', id);
      return quizService.generateQuiz(id);
    },
    onSuccess: (response) => {
      console.log('[QUIZ] Quiz generated successfully:', response);
      navigate(`/quiz/${id}`);
    },
    onError: (error: any) => {
      console.error('[QUIZ] Error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to generate quiz';
      console.error('[QUIZ] Error details:', error.response?.data);
      setToast({ type: 'error', message: errorMessage });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (content: string) => noteService.createNote(id!, content),
    onSuccess: () => {
      setNoteContent('');
      queryClient.invalidateQueries({ queryKey: ['notes', id] });
      setToast({ type: 'success', message: 'Note added!' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to add note';
      setToast({ type: 'error', message: errorMessage });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: (content: string) => noteService.updateNote(editingNoteId!, content),
    onSuccess: () => {
      setEditingNoteId(null);
      setEditingContent('');
      queryClient.invalidateQueries({ queryKey: ['notes', id] });
      setToast({ type: 'success', message: 'Note updated!' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to update note';
      setToast({ type: 'error', message: errorMessage });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => noteService.deleteNote(noteId),
    onSuccess: () => {
      setDeleteConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ['notes', id] });
      setToast({ type: 'success', message: 'Note deleted!' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to delete note';
      setToast({ type: 'error', message: errorMessage });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const shareFlashcardsMutation = useMutation({
    mutationFn: (userIds: string[]) => {
      if (!sharedFlashcardSet?.id) throw new Error('No shared set created yet');
      return sharingAPI.shareFlashcardWith(sharedFlashcardSet.id, userIds);
    },
    onSuccess: () => {
      setToast({ type: 'success', message: 'Flashcards shared successfully!' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to share flashcards';
      setToast({ type: 'error', message: errorMessage });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const togglePublicFlashcardsMutation = useMutation({
    mutationFn: () => {
      if (!sharedFlashcardSet?.id) throw new Error('No shared set created yet');
      return sharingAPI.toggleFlashcardPublic(sharedFlashcardSet.id);
    },
    onSuccess: (response) => {
      const updated = response.data?.data || response.data;
      setSharedFlashcardSet(updated);
      setToast({ type: 'success', message: `Flashcards set to ${updated.isPublic ? 'public' : 'private'}!` });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to toggle public status';
      setToast({ type: 'error', message: errorMessage });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const createSharedFlashcardSetMutation = useMutation({
    mutationFn: (flashcardIds: string[]) =>
      sharingAPI.createFlashcardSet(flashcardIds, `${lectureData?.title} - Flashcards`),
    onSuccess: (response) => {
      const created = response.data?.data || response.data;
      setSharedFlashcardSet(created);
      setToast({ type: 'success', message: 'Shared set created! Now you can share with users.' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to create shared set';
      setToast({ type: 'error', message: errorMessage });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const createSharedQuizSetMutation = useMutation({
    mutationFn: (quizIds: string[]) =>
      sharingAPI.createQuizSet(quizIds, `${lectureData?.title} - Quiz`),
    onSuccess: (response) => {
      const created = response.data?.data || response.data;
      setSharedQuizSet(created);
      setToast({ type: 'success', message: 'Quiz share created! Now you can share with users.' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to create quiz share';
      setToast({ type: 'error', message: errorMessage });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const shareQuizMutation = useMutation({
    mutationFn: (userIds: string[]) => {
      if (!sharedQuizSet?.id) throw new Error('No shared quiz created yet');
      return sharingAPI.shareQuizWith(sharedQuizSet.id, userIds);
    },
    onSuccess: () => {
      setToast({ type: 'success', message: 'Quiz shared successfully!' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to share quiz';
      setToast({ type: 'error', message: errorMessage });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const togglePublicQuizMutation = useMutation({
    mutationFn: () => {
      if (!sharedQuizSet?.id) throw new Error('No shared quiz created yet');
      return sharingAPI.toggleQuizPublic(sharedQuizSet.id);
    },
    onSuccess: (response) => {
      const updated = response.data?.data || response.data;
      setSharedQuizSet(updated);
      setToast({ type: 'success', message: `Quiz set to ${updated.isPublic ? 'public' : 'private'}!` });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to toggle public status';
      setToast({ type: 'error', message: errorMessage });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const handleOpenShareModal = async (type: 'flashcard' | 'quiz' = 'flashcard') => {
    if (!id) return;

    try {
      setShareLoading(true);
      console.log(`[SHARE] Starting ${type} share modal preparation...`);

      const token = useAuthStore.getState().token;
      console.log('[SHARE] Auth token present:', !!token);

      if (type === 'flashcard') {
        const flashcardsResponse = await flashcardService.getFlashcards(id);
        const flashcards = flashcardsResponse.data?.data || flashcardsResponse.data || [];

        console.log('[SHARE] Fetched flashcards count:', flashcards.length);

        if (flashcards.length === 0) {
          setToast({ type: 'error', message: 'No flashcards to share. Generate flashcards first!' });
          setTimeout(() => setToast(null), 3000);
          return;
        }

        const flashcardIds = flashcards.map((f: any) => f.id);
        console.log('[SHARE] Creating shared flashcard set with IDs:', flashcardIds);

        await createSharedFlashcardSetMutation.mutateAsync(flashcardIds);
      } else {
        const quizzesResponse = await quizService.getHistory();
        const quizzes = quizzesResponse.data?.data || quizzesResponse.data || [];

        console.log('[SHARE] Fetched quizzes count:', quizzes.length);

        if (quizzes.length === 0) {
          setToast({ type: 'error', message: 'No quizzes to share. Generate a quiz first!' });
          setTimeout(() => setToast(null), 3000);
          return;
        }

        const quizIds = quizzes.map((q: any) => q.id);
        console.log('[SHARE] Creating shared quiz set with IDs:', quizIds);

        await createSharedQuizSetMutation.mutateAsync(quizIds);
      }

      setShowShareModal(true);
    } catch (error: any) {
      console.error('[SHARE] Error opening share modal:', error);
      console.error('[SHARE] Error response:', error.response?.data);

      const errorMsg = error.response?.data?.error || error.message || 'Failed to prepare sharing';
      setToast({ type: 'error', message: errorMsg });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setShareLoading(false);
    }
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

  const lectureData = lecture;

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-400" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{lectureData?.title}</h1>
              <p className="text-slate-400">
                Created {new Date(lectureData?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => {
                setShareType('flashcard');
                handleOpenShareModal('flashcard');
              }}
              disabled={shareLoading || createSharedFlashcardSetMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Share flashcards"
            >
              <Share2 className="w-4 h-4" />
              {shareLoading || createSharedFlashcardSetMutation.isPending ? 'Preparing...' : 'Share FC'}
            </button>
            <button
              onClick={() => {
                setShareType('quiz');
                handleOpenShareModal('quiz');
              }}
              disabled={shareLoading || createSharedQuizSetMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Share quizzes"
            >
              <Share2 className="w-4 h-4" />
              {shareLoading || createSharedQuizSetMutation.isPending ? 'Preparing...' : 'Share Q'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Summary Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  Summary
                </h2>
              </div>

              {summary ? (
                <div className="space-y-6">
                  {/* Title */}
                  {summary.title && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{summary.title}</h3>
                    </div>
                  )}

                  {/* Summary Text */}
                  {summary.summary && (
                    <div>
                      <p className="text-slate-300 leading-relaxed">{summary.summary}</p>
                    </div>
                  )}

                  {/* Key Topics */}
                  {summary.keyTopics && summary.keyTopics.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-3">KEY TOPICS</p>
                      <div className="flex flex-wrap gap-2">
                        {summary.keyTopics.map((topic: string) => (
                          <span
                            key={topic}
                            className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important Terms */}
                  {summary.importantTerms && summary.importantTerms.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-400 mb-3">IMPORTANT TERMS</p>
                      <div className="space-y-3">
                        {summary.importantTerms.slice(0, 5).map((term: { term: string; definition: string }) => (
                          <div key={term.term} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                            <p className="font-semibold text-white">{term.term}</p>
                            <p className="text-sm text-slate-400 mt-1">{term.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {summaryError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-300">Error generating summary</p>
                        <p className="text-sm text-red-300/80 mt-1">{summaryError}</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSummaryError(null);
                      summaryMutation.mutate();
                    }}
                    disabled={summaryMutation.isPending}
                    className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {summaryMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Generating Summary...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Summary</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* My Notes Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
              <BookOpen className="w-6 h-6 text-blue-400" />
              My Notes
            </h2>

            {/* Add Note */}
            <div className="mb-6 pb-6 border-b border-slate-800">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none mb-3"
              />
              <button
                onClick={() => {
                  if (noteContent.trim()) {
                    createNoteMutation.mutate(noteContent);
                  }
                }}
                disabled={createNoteMutation.isPending || !noteContent.trim()}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createNoteMutation.isPending ? 'Adding...' : 'Add Note'}
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              {notesData && Array.isArray(notesData) && notesData.length > 0 ? (
                notesData.map((note: any) => (
                  <div key={note.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    {editingNoteId === note.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateNoteMutation.mutate(editingContent)}
                            disabled={updateNoteMutation.isPending}
                            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            {updateNoteMutation.isPending ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditingContent('');
                            }}
                            className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="text-slate-300 text-sm leading-relaxed">{note.content}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditingContent(note.content);
                            }}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-blue-400"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(note.id)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Delete Confirmation */}
                    {deleteConfirmId === note.id && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
                        <p className="text-sm text-red-300">Delete this note?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteNoteMutation.mutate(note.id)}
                            disabled={deleteNoteMutation.isPending}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                          >
                            {deleteNoteMutation.isPending ? 'Deleting...' : 'Delete'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm">No notes yet. Add your first note!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => generateFlashcardsMutation.mutate()}
                  disabled={!summary || generateFlashcardsMutation.isPending}
                  className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generateFlashcardsMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Generate Flashcards</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => generateQuizMutation.mutate()}
                  disabled={!summary || generateQuizMutation.isPending}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generateQuizMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-5 h-5" />
                      <span>Take Quiz</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate(`/lectures/${id}/review`)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-5 h-5" />
                  <span>Review Flashcards</span>
                </button>
              </div>

              {!summary && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-300">Generate a summary first to unlock flashcards and quiz</p>
                </div>
              )}

              {flashcardsCount > 0 && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-300">{flashcardsCount} flashcards ready</p>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Lecture Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-400">Created</p>
                  <p className="text-white font-medium">
                    {new Date(lectureData?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50"
          style={{
            backgroundColor: toast.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: toast.type === 'success' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <p className={toast.type === 'success' ? 'text-green-300' : 'text-red-300'}>
            {toast.message}
          </p>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        title={shareType === 'flashcard'
          ? `${lectureData?.title || 'Lecture'} Flashcards`
          : `${lectureData?.title || 'Lecture'} Quizzes`
        }
        shareToken={shareType === 'flashcard' ? sharedFlashcardSet?.shareToken : sharedQuizSet?.shareToken}
        isPublic={shareType === 'flashcard' ? (sharedFlashcardSet?.isPublic || false) : (sharedQuizSet?.isPublic || false)}
        sharedUsers={shareType === 'flashcard'
          ? (sharedFlashcardSet?.sharedWith?.map((s: any) => ({
            id: s.userId,
            name: s.user?.name || 'Unknown',
            email: s.user?.email || ''
          })) || [])
          : (sharedQuizSet?.sharedWith?.map((s: any) => ({
            id: s.userId,
            name: s.user?.name || 'Unknown',
            email: s.user?.email || ''
          })) || [])
        }
        onClose={() => setShowShareModal(false)}
        onShareWithUsers={async (userIds) =>
          shareType === 'flashcard'
            ? shareFlashcardsMutation.mutate(userIds)
            : shareQuizMutation.mutate(userIds)
        }
        onTogglePublic={async () =>
          shareType === 'flashcard'
            ? togglePublicFlashcardsMutation.mutate()
            : togglePublicQuizMutation.mutate()
        }
        isLoading={shareType === 'flashcard'
          ? (shareFlashcardsMutation.isPending || togglePublicFlashcardsMutation.isPending)
          : (shareQuizMutation.isPending || togglePublicQuizMutation.isPending)
        }
      />
    </Layout>
  );
}
