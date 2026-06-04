import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  isLoading?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = 'Add a comment...',
  isLoading = false,
}) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setError('');
      await onSubmit(content);
      setContent('');
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setError('');
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        rows={3}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 outline-none focus:border-purple-600/50 focus:ring-1 focus:ring-purple-600/20 transition-all resize-none disabled:opacity-50"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Ctrl+Enter to submit</p>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isLoading}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {isLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
};

export default CommentForm;
