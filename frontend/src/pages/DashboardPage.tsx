import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService, flashcardService, courseService, studyPlanService } from '../services';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { BookOpen, Zap, BarChart3, TrendingUp, ArrowRight, Calendar, RefreshCw, ChevronDown, X, Trash2 } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

const activityIcon: Record<string, string> = {
  course: '📚',
  lecture: '📄',
  flashcards: '🃏',
  quiz: '✅',
};

interface Lecture {
  id: string;
  title: string;
  courseTitle: string;
}

function LectureMultiSelect({
  lectures,
  selected,
  onChange,
}: {
  lectures: Lecture[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(
    () => lectures.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()) || l.courseTitle.toLowerCase().includes(search.toLowerCase())),
    [lectures, search]
  );

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  const selectedTitles = lectures.filter((l) => selected.includes(l.id)).map((l) => l.title);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-left hover:border-slate-600 transition-colors focus:outline-none focus:border-amber-500"
      >
        <span className={selected.length === 0 ? 'text-slate-400 text-sm' : 'text-white text-sm'}>
          {selected.length === 0
            ? 'All lectures (no filter)'
            : selected.length === 1
            ? selectedTitles[0]
            : `${selected.length} lectures selected`}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange([]); }}
              className="text-slate-400 hover:text-white"
              aria-label="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-700">
            <input
              autoFocus
              type="text"
              placeholder="Search lectures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">No lectures found</p>
            ) : (
              filtered.map((l) => {
                const checked = selected.includes(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => toggle(l.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-700 transition-colors ${checked ? 'bg-amber-600/10' : ''}`}
                  >
                    <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${checked ? 'bg-amber-500 border-amber-500' : 'border-slate-500'}`}>
                      {checked && <span className="text-white text-xs font-bold">✓</span>}
                    </span>
                    <span className="flex-1 text-sm text-white truncate">{l.title}</span>
                    <span className="text-xs text-slate-500 flex-shrink-0 ml-2 truncate max-w-[100px]">{l.courseTitle}</span>
                  </button>
                );
              })
            )}
          </div>
          {selected.length > 0 && (
            <div className="p-2 border-t border-slate-700 flex justify-between items-center">
              <span className="text-xs text-slate-400">{selected.length} selected</span>
              <button type="button" onClick={() => onChange([])} className="text-xs text-amber-400 hover:text-amber-300">Clear all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [examDate, setExamDate] = useState('');
  const [showStudyPlanForm, setShowStudyPlanForm] = useState(false);
  const [selectedLectureIds, setSelectedLectureIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsService.getAnalytics(),
  });

  const { data: dueFlashcards } = useQuery({
    queryKey: ['flashcards', 'due'],
    queryFn: () => flashcardService.getDueFlashcards(),
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getCourses(),
    select: (data) => {
      const normalized = data?.data?.data || data?.data || data || [];
      return normalized;
    },
  });

  const allLectures: Lecture[] = useMemo(() => {
    if (!Array.isArray(courses)) return [];
    return courses.flatMap((c: any) =>
      (c.lectures || []).map((l: any) => ({ id: l.id, title: l.title, courseTitle: c.title }))
    );
  }, [courses]);

  const { data: activityData } = useQuery({
    queryKey: ['activity'],
    queryFn: () => analyticsService.getActivity(),
    select: (res) => {
      const d = res?.data;
      return Array.isArray(d) ? d : (d?.data || []);
    },
  });

  const { data: savedPlan, isLoading: planLoading } = useQuery({
    queryKey: ['study-plan'],
    queryFn: () => studyPlanService.getStudyPlan(),
    select: (res) => res?.data ?? null,
    retry: false,
  });

  const studyPlanMutation = useMutation({
    mutationFn: () =>
      studyPlanService.generateStudyPlan(
        examDate,
        selectedLectureIds.length > 0 ? selectedLectureIds : undefined
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plan'] });
      setShowStudyPlanForm(false);
      setExamDate('');
      setSelectedLectureIds([]);
    },
    onError: (error: any) => {
      console.error('Failed to generate study plan:', error);
      alert('Failed to generate study plan. Please try again.');
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: () => studyPlanService.deleteStudyPlan(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plan'] });
      setConfirmDelete(false);
      setShowStudyPlanForm(false);
    },
  });

  const stats = [
    { label: 'Courses', value: courses?.length || 0, icon: BookOpen, color: 'from-blue-600 to-blue-700', bgColor: 'bg-blue-500/10' },
    { label: 'Due Today', value: dueFlashcards?.data?.data?.length || 0, icon: Zap, color: 'from-purple-600 to-purple-700', bgColor: 'bg-purple-500/10' },
    { label: 'Quizzes Taken', value: analytics?.data?.quizzesTaken || 0, icon: BarChart3, color: 'from-pink-600 to-pink-700', bgColor: 'bg-pink-500/10' },
    { label: 'Average Score', value: `${analytics?.data?.avgScore || 0}%`, icon: TrendingUp, color: 'from-green-600 to-green-700', bgColor: 'bg-green-500/10' },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-400">Here's what's happening with your learning today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all duration-200 group">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} ${stat.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <button
            onClick={() => navigate('/courses')}
            className="group bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl p-8 text-left transition-all duration-200 border border-blue-500/20 hover:border-blue-500/40"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">My Courses</h3>
                <p className="text-blue-100">Manage and explore your courses</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-100 group-hover:gap-3 transition-all">
              <span className="text-sm font-medium">View all courses</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={() => navigate('/review')}
            className="group bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl p-8 text-left transition-all duration-200 border border-purple-500/20 hover:border-purple-500/40"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Review Flashcards</h3>
                <p className="text-purple-100">{dueFlashcards?.data?.data?.length || 0} cards due today</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-purple-100 group-hover:gap-3 transition-all">
              <span className="text-sm font-medium">Start reviewing</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-12">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          {activityData && activityData.length > 0 ? (
            <div className="space-y-4">
              {activityData.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{activityIcon[item.type] ?? '📌'}</span>
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      {item.subLabel && <p className="text-slate-400 text-sm">{item.subLabel}</p>}
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm flex-shrink-0 ml-4">{timeAgo(item.time)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">No activity yet. Start by adding a course!</p>
            </div>
          )}
        </div>

        {/* Study Plan Section */}
        <div>
          {!planLoading && savedPlan && !showStudyPlanForm ? (
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Your Study Plan
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Exam: {new Date(savedPlan.examDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {' · '}
                    Generated {timeAgo(savedPlan.generatedAt)}
                  </p>
                  {savedPlan.selectedLectures && savedPlan.selectedLectures.length > 0 && (
                    <p className="text-slate-400 text-sm mt-1">
                      Scope: {savedPlan.selectedLectures.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowStudyPlanForm(true)}
                    className="flex items-center gap-2 text-sm px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate
                  </button>
                  {confirmDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">Delete plan?</span>
                      <button
                        onClick={() => deletePlanMutation.mutate()}
                        disabled={deletePlanMutation.isPending}
                        className="text-sm px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        {deletePlanMutation.isPending ? 'Deleting...' : 'Yes, delete'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="text-sm px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-2 text-sm px-3 py-1.5 bg-slate-700 hover:bg-red-700 text-slate-300 hover:text-white rounded transition-colors"
                      title="Delete study plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Study Strategy</h3>
                  <p className="text-green-100 leading-relaxed">{savedPlan.plan}</p>
                </div>

                {savedPlan.dailyGoals && savedPlan.dailyGoals.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Daily Goals</h3>
                    <div className="space-y-2">
                      {savedPlan.dailyGoals.map((goal: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm font-bold">{idx + 1}</span>
                          </div>
                          <p className="text-green-100">{goal}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Personalized Study Plan
                  </h2>
                  <p className="text-amber-100">
                    Get an AI-powered study plan built from your actual courses, lectures, quiz scores, and weak areas
                  </p>
                </div>
              </div>

              {showStudyPlanForm ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Exam Date</label>
                    <input
                      type="date"
                      value={examDate}
                      min={todayISO()}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {allLectures.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Lectures{' '}
                        <span className="text-slate-400 font-normal">(optional — leave unfiltered to include all)</span>
                      </label>
                      <LectureMultiSelect
                        lectures={allLectures}
                        selected={selectedLectureIds}
                        onChange={setSelectedLectureIds}
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => studyPlanMutation.mutate()}
                      disabled={!examDate || studyPlanMutation.isPending}
                      className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-lg font-medium transition-colors"
                    >
                      {studyPlanMutation.isPending
                        ? 'Generating...'
                        : selectedLectureIds.length > 0
                        ? `Generate Plan (${selectedLectureIds.length} lecture${selectedLectureIds.length > 1 ? 's' : ''})`
                        : 'Generate Plan'}
                    </button>
                    <button
                      onClick={() => {
                        setShowStudyPlanForm(false);
                        setExamDate('');
                        setSelectedLectureIds([]);
                      }}
                      className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowStudyPlanForm(true)}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Create Study Plan
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
