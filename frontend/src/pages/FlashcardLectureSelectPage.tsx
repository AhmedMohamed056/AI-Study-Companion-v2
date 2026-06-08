import { useState, useMemo } from 'react';
import { Search, BookOpen, RotateCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '../services';
import { LoadingSpinner } from '../components/Common';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

interface Lecture {
  id: string;
  title: string;
  courseId: string;
  course?: { title: string };
  flashcardCount: number;
  createdAt: string;
}

export default function FlashcardLectureSelectPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: coursesResponse, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getCourses(),
    select: (data) => {
      const normalized = data?.data?.data || data?.data || data || [];
      return normalized;
    },
  });

  const allLectures: Lecture[] = useMemo(() => {
    if (!coursesResponse || !Array.isArray(coursesResponse)) return [];

    const lecturesList: Lecture[] = [];
    coursesResponse.forEach((course: any) => {
      if (course.lectures && Array.isArray(course.lectures)) {
        course.lectures.forEach((lecture: any) => {
          if ((lecture.flashcardCount ?? 0) > 0) {
            lecturesList.push({
              ...lecture,
              course: { title: course.title },
              flashcardCount: lecture.flashcardCount ?? 0,
            });
          }
        });
      }
    });
    return lecturesList;
  }, [coursesResponse]);

  const filteredLectures = allLectures.filter(
    (lecture) =>
      lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.course?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Review Flashcards</h1>
            <p className="text-slate-400">Choose a lecture to review its flashcards</p>
          </div>

          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search lectures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-12 pr-4 py-3 text-slate-200 placeholder-slate-500 outline-none focus:border-purple-600/50 focus:ring-1 focus:ring-purple-600/20 transition-all"
            />
          </div>

          {filteredLectures.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 text-lg mb-4">
                {allLectures.length === 0
                  ? 'No lectures with flashcards yet'
                  : 'No lectures match your search'}
              </p>
              {allLectures.length === 0 && (
                <button
                  onClick={() => navigate('/courses')}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Go to Courses
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLectures.map((lecture) => (
                <button
                  key={lecture.id}
                  onClick={() => navigate(`/lectures/${lecture.id}/review`)}
                  className="w-full text-left bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-purple-600/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1">{lecture.title}</h3>
                      <p className="text-sm text-slate-400">{lecture.course?.title}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-400">{lecture.flashcardCount}</div>
                        <p className="text-xs text-slate-400">flashcards</p>
                      </div>
                      <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <RotateCw className="w-5 h-5 text-purple-400" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
