import { useQuery, useMutation } from '@tanstack/react-query';
import { analyticsService, flashcardService, courseService, studyPlanService } from '../services';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { BookOpen, Zap, BarChart3, TrendingUp, ArrowRight, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [examDate, setExamDate] = useState('');
  const [showStudyPlanForm, setShowStudyPlanForm] = useState(false);
  const [studyPlan, setStudyPlan] = useState<{ plan: string; dailyGoals: string[] } | null>(null);

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
    queryFn: async () => {
      const response = await courseService.getCourses();
      return response;
    },
    select: (data) => {
      const normalized = data?.data?.data || data?.data || data || [];
      return normalized;
    },
  });

  const studyPlanMutation = useMutation({
    mutationFn: () => studyPlanService.generateStudyPlan(examDate),
    onSuccess: (response) => {
      setStudyPlan(response.data);
      setShowStudyPlanForm(false);
    },
    onError: (error: any) => {
      console.error('Failed to generate study plan:', error);
      alert('Failed to generate study plan. Please try again.');
    },
  });

  const stats = [
    {
      label: 'Courses',
      value: courses?.length || 0,
      icon: BookOpen,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Due Today',
      value: dueFlashcards?.data?.data?.length || 0,
      icon: Zap,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Quizzes Taken',
      value: analytics?.data?.quizzesTaken || 0,
      icon: BarChart3,
      color: 'from-pink-600 to-pink-700',
      bgColor: 'bg-pink-500/10',
    },
    {
      label: 'Average Score',
      value: `${analytics?.data?.avgScore || 0}%`,
      icon: TrendingUp,
      color: 'from-green-600 to-green-700',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        {/* Welcome Section */}
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
              <div
                key={stat.label}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all duration-200 group"
              >
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: 'Started learning', subject: 'Advanced Calculus', time: '2 hours ago' },
              { action: 'Completed quiz', subject: 'Linear Algebra', time: '5 hours ago' },
              { action: 'Reviewed flashcards', subject: 'Biology', time: '1 day ago' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                <div>
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-slate-400 text-sm">{activity.subject}</p>
                </div>
                <p className="text-slate-500 text-sm">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Study Plan Section */}
        <div className="mt-12">
          {!studyPlan ? (
            <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Personalized Study Plan
                  </h2>
                  <p className="text-amber-100">Get an AI-powered study plan tailored to your exam date and weak areas</p>
                </div>
              </div>

              {showStudyPlanForm ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Exam Date</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => studyPlanMutation.mutate()}
                      disabled={!examDate || studyPlanMutation.isPending}
                      className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                    >
                      {studyPlanMutation.isPending ? 'Generating...' : 'Generate Plan'}
                    </button>
                    <button
                      onClick={() => {
                        setShowStudyPlanForm(false);
                        setExamDate('');
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
          ) : (
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-xl p-8">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Your Study Plan
                </h2>
                <button
                  onClick={() => setStudyPlan(null)}
                  className="text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                >
                  New Plan
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Study Strategy</h3>
                  <p className="text-green-100 leading-relaxed">{studyPlan.plan}</p>
                </div>

                {studyPlan.dailyGoals && studyPlan.dailyGoals.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Daily Goals</h3>
                    <div className="space-y-2">
                      {studyPlan.dailyGoals.map((goal, idx) => (
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
          )}
        </div>
      </div>
    </Layout>
  );
}
