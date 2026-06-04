import React, { useState } from 'react';
import { MessageSquare, Trash2, Pin, PinOff, ChevronDown, ChevronUp } from 'lucide-react';
import { commentsAPI } from '../services/api';

interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  replies?: Comment[];
}

interface CommentThreadProps {
  comments: Comment[];
  onCommentDeleted?: (commentId: string) => void;
  onCommentEdited?: (commentId: string, content: string) => void;
  currentUserId: string;
  isGroupOwner?: boolean;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  onCommentDeleted,
  onCommentEdited,
  currentUserId,
  isGroupOwner = false,
}) => {
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      setLoadingId(commentId);
      await commentsAPI.deleteComment(commentId);
      onCommentDeleted?.(commentId);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      setLoadingId(commentId);
      await commentsAPI.editComment(commentId, editContent);
      onCommentEdited?.(commentId, editContent);
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Failed to edit comment:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleTogglePin = async (commentId: string) => {
    try {
      setLoadingId(commentId);
      await commentsAPI.togglePinComment(commentId);
      // Note: Full refresh would be needed for full UI update
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isAuthor = comment.author.id === currentUserId;
    const isEditing = editingId === comment.id;

    return (
      <div key={comment.id} className={`space-y-3 ${isReply ? 'ml-8' : ''}`}>
        {/* Comment Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 group">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-200">{comment.author.name}</p>
              <p className="text-xs text-slate-500">{comment.author.email}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <time className="text-xs text-slate-500">{formatDate(comment.createdAt)}</time>
            </div>
          </div>

          {/* Content or Edit Mode */}
          {isEditing ? (
            <div className="space-y-2 mt-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200 outline-none focus:border-purple-600/50"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(comment.id)}
                  disabled={loadingId === comment.id}
                  className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-300 mt-2">{comment.content}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAuthor && (
              <>
                <button
                  onClick={() => {
                    setEditingId(comment.id);
                    setEditContent(comment.content);
                  }}
                  className="text-xs text-slate-400 hover:text-purple-400 transition-colors"
                >
                  Edit
                </button>
                <span className="text-slate-600">•</span>
              </>
            )}

            {(isAuthor || isGroupOwner) && (
              <>
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={loadingId === comment.id}
                  className="text-xs text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
                <span className="text-slate-600">•</span>
              </>
            )}

            {isGroupOwner && (
              <button
                onClick={() => handleTogglePin(comment.id)}
                className="text-xs text-slate-400 hover:text-yellow-400 transition-colors flex items-center gap-1"
              >
                {comment.isPinned ? (
                  <>
                    <PinOff className="w-3 h-3" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="w-3 h-3" />
                    Pin
                  </>
                )}
              </button>
            )}

            <span className="text-slate-600 ml-auto">•</span>
            <button
              onClick={() => {
                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                setReplyContent('');
              }}
              className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              Reply
            </button>
          </div>
        </div>

        {/* Reply Input */}
        {replyingTo === comment.id && (
          <div className="ml-8 space-y-2">
            <textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-purple-600/50 resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!replyContent.trim()) return;
                  try {
                    setLoadingId(comment.id);
                    await commentsAPI.createReply(comment.id, replyContent);
                    setReplyingTo(null);
                    setReplyContent('');
                  } catch (err) {
                    console.error('Failed to create reply:', err);
                  } finally {
                    setLoadingId(null);
                  }
                }}
                disabled={loadingId === comment.id || !replyContent.trim()}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                Reply
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-4">
            <button
              onClick={() => toggleReplies(comment.id)}
              className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1 mb-2"
            >
              {expandedReplies.has(comment.id) ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Hide {comment.replies.length} repl{comment.replies.length !== 1 ? 'ies' : 'y'}
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show {comment.replies.length} repl{comment.replies.length !== 1 ? 'ies' : 'y'}
                </>
              )}
            </button>

            {expandedReplies.has(comment.id) && (
              <div className="space-y-3">
                {comment.replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-center text-slate-500 py-8">No comments yet. Be the first to comment!</p>
      ) : (
        comments.map((comment) => renderComment(comment))
      )}
    </div>
  );
};

export default CommentThread;
