import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services';
import { useAuthStore } from '../store/auth';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const mutation = useMutation({
    mutationFn: () => authService.register(email, password, name),
    onSuccess: (response) => {
      console.log('[REGISTER] Success response:', response);
      console.log('[REGISTER] Response data:', response.data);

      // Extract from response.data.data (backend wraps response)
      const responseData = response.data.data || response.data;
      const { token, user } = responseData;

      console.log('[REGISTER] Extracted token:', token ? 'token found' : 'token missing');
      console.log('[REGISTER] Extracted user:', user);

      if (!token || !user) {
        console.error('[REGISTER] Missing token or user in response');
        setError('Invalid server response. Please try again.');
        return;
      }

      setError('');
      setToken(token);
      setUser(user);
      console.log('[REGISTER] Token and user set, navigating to dashboard...');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('[REGISTER] Error:', error);
      const errorMessage = error.response?.data?.error
        || error.response?.data?.message
        || error.message
        || 'Registration failed. Please try again.';
      setError(errorMessage);
    },
  });

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-700 to-purple-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-white">StudyAI</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Start Your Learning Journey
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-md">
            Join thousands of students using AI to study smarter and achieve better grades.
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          {[
            'Free to get started',
            'No credit card required',
            'Instant AI-powered tools',
            'Join our community',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3 text-blue-100">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-slate-400">Join StudyAI and start learning smarter today</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError('');
              mutation.mutate();
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Creating account...' : 'Create account'}
              {!mutation.isPending && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400">
            Already have an account?{' '}
            <a href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
