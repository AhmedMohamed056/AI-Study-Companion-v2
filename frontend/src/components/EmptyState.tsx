import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: 'primary' | 'secondary';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'primary',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-4 p-4 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full border border-purple-600/20">
        <Icon className="w-8 h-8 text-purple-400" />
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-center max-w-sm mb-6">{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            actionVariant === 'primary'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
