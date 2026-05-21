import { useQuery } from '@tanstack/react-query';
import { analyticsService, flashcardService, courseService } from '../services';
import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { BookOpen, Zap, BarChart3, TrendingUp, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

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
      value: dueFlashcards?.data?.length || 0,
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
                <p className="text-purple-100">{dueFlashcards?.data?.length || 0} cards due today</p>
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
      </div>
    </Layout>
  );
}
