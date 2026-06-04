import React from 'react';
import { Users, Settings, LogOut, Trash2 } from 'lucide-react';

interface StudyGroupCardProps {
  name: string;
  description?: string;
  memberCount: number;
  materialCount: number;
  isOwner: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onLeave?: () => void;
}

export const StudyGroupCard: React.FC<StudyGroupCardProps> = ({
  name,
  description,
  memberCount,
  materialCount,
  isOwner,
  onClick,
  onEdit,
  onDelete,
  onLeave,
}) => {
  return (
    <div
      onClick={onClick}
      className="group bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-600/10 transition-all cursor-pointer"
    >
      {/* Header with title and actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-400 transition-colors">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-slate-400 line-clamp-2 mt-1">{description}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          {isOwner && onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit group"
            >
              <Settings className="w-4 h-4 text-slate-400 hover:text-purple-400" />
            </button>
          )}

          {isOwner && onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Delete group"
            >
              <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
            </button>
          )}

          {!isOwner && onLeave && (
            <button
              onClick={onLeave}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              title="Leave group"
            >
              <LogOut className="w-4 h-4 text-slate-400 hover:text-orange-400" />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs bg-slate-800 px-2 py-1 rounded">
            {materialCount} material{materialCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Owner badge */}
      {isOwner && (
        <div className="mt-4 inline-block">
          <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded border border-purple-600/30 font-medium">
            Owner
          </span>
        </div>
      )}
    </div>
  );
};

export default StudyGroupCard;
