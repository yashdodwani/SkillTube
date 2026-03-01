import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, PlayCircle, Trophy, ChevronRight, Loader2 } from 'lucide-react';
import { userAPI } from '../services/api';
import { UserCourse } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{value} / {max}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CourseCard({ uc }: { uc: UserCourse }) {
  const chunksTotal = uc.total_chunks;
  const quizzesTotal = uc.total_chunks; // one quiz per chunk
  const chunksCompleted = uc.chunks_completed.length;
  const quizzesCompleted = uc.quizzes_completed.length;
  const overallPct = chunksTotal > 0
    ? Math.round(((chunksCompleted + quizzesCompleted) / (chunksTotal * 2)) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-base leading-snug">
            {uc.course.title || `Video ${uc.course.video_id}`}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Saved {new Date(uc.saved_at).toLocaleDateString()}</p>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColors[uc.course.difficulty_level] ?? 'bg-gray-100 text-gray-600'}`}>
          {uc.course.difficulty_level}
        </span>
      </div>

      {/* Thumbnail */}
      <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
        <img
          src={`https://img.youtube.com/vi/${uc.course.video_id}/mqdefault.jpg`}
          alt={uc.course.title ?? ''}
          className="w-full h-full object-cover"
        />
        {overallPct === 100 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Trophy className="h-10 w-10 text-yellow-400" />
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Chunks watched</span>
          </div>
          <ProgressBar value={chunksCompleted} max={chunksTotal} color="bg-blue-500" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Quizzes completed</span>
          </div>
          <ProgressBar value={quizzesCompleted} max={quizzesTotal} color="bg-purple-500" />
        </div>
      </div>

      {/* CTA */}
      <Link
        to={`/course/${uc.course.id}`}
        className="flex items-center justify-center gap-2 w-full bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium text-sm py-2.5 rounded-xl transition-colors"
      >
        <PlayCircle className="h-4 w-4" />
        {overallPct === 100 ? 'Review course' : overallPct > 0 ? 'Continue learning' : 'Start learning'}
        <ChevronRight className="h-4 w-4 ml-auto" />
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userAPI.getSavedCourses()
      .then(setCourses)
      .catch(() => setError('Failed to load your courses.'))
      .finally(() => setLoading(false));
  }, []);

  const totalChunks = courses.reduce((s, c) => s + c.chunks_completed.length, 0);
  const totalQuizzes = courses.reduce((s, c) => s + c.quizzes_completed.length, 0);
  const completedCourses = courses.filter(
    (c) => c.total_chunks > 0 && c.chunks_completed.length >= c.total_chunks && c.quizzes_completed.length >= c.total_chunks
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{user ? `, ${user.email.split('@')[0]}` : ''}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your learning progress at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Saved courses', value: courses.length, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
          { label: 'Completed', value: completedCourses, icon: Trophy, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Chunks watched', value: totalChunks, icon: PlayCircle, color: 'text-purple-600 bg-purple-50' },
          { label: 'Quizzes passed', value: totalQuizzes, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Courses grid */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
        <Link to="/" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          + Add course
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No saved courses yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">Generate a course and save it to track your progress</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <PlayCircle className="h-4 w-4" />
            Generate my first course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((uc) => (
            <CourseCard key={uc.id} uc={uc} />
          ))}
        </div>
      )}
    </div>
  );
}

