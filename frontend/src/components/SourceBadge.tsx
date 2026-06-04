import React from 'react';
import { BookOpen, Calendar } from 'lucide-react';

interface SourceBadgeProps {
  lectureTitle?: string;
  courseName?: string;
  createdAt?: Date | string;
  onNavigateToLecture?: () => void;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  lectureTitle,
  courseName,
  createdAt,
  onNavigateToLecture,
}) => {
  if (!lectureTitle) {
    return null;
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className={`rounded-lg bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-600/20 p-3 transition-all ${
        onNavigateToLecture ? 'cursor-pointer hover:from-purple-600/20 hover:to-blue-600/20' : ''
      }`}
      onClick={onNavigateToLecture}
    >
      <div className="flex items-start gap-3">
        <BookOpen className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            <div>
              <p className="text-xs text-slate-500 font-medium">From Lecture</p>
              <p className="text-sm font-semibold text-slate-200 truncate">{lectureTitle}</p>
            </div>

            {courseName && (
              <p className="text-xs text-slate-400">
                in <span className="text-slate-300 font-medium">{courseName}</span>
              </p>
            )}

            {createdAt && (
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(createdAt)}</span>
              </div>
            )}
          </div>
        </div>

        {onNavigateToLecture && (
          <div className="flex-shrink-0 text-xs text-purple-600 font-medium">View →</div>
        )}
      </div>
    </div>
  );
};

export default SourceBadge;
