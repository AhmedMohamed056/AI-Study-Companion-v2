import React, { useState } from 'react';
import { X, Mail, UserPlus } from 'lucide-react';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (userIds: string[], emails: string[]) => Promise<void>;
  isLoading?: boolean;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  isLoading = false,
}) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddEmail = () => {
    const trimmed = currentInput.trim();

    if (!trimmed) {
      setError('Please enter an email');
      return;
    }

    if (!isValidEmail(trimmed)) {
      setError('Please enter a valid email');
      return;
    }

    if (emails.includes(trimmed)) {
      setError('This email is already added');
      return;
    }

    setEmails([...emails, trimmed]);
    setCurrentInput('');
    setError('');
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
    setError('');
  };

  const handleInvite = async () => {
    if (emails.length === 0) {
      setError('Please add at least one email');
      return;
    }

    try {
      await onInvite([], emails);
      setEmails([]);
      setCurrentInput('');
      setError('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send invites');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Invite Members</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={currentInput}
                  onChange={(e) => {
                    setCurrentInput(e.target.value);
                    setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-purple-600/50 focus:ring-1 focus:ring-purple-600/20 transition-all"
                />
              </div>
              <button
                onClick={handleAddEmail}
                disabled={!currentInput.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add
              </button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* Added Emails List */}
          {emails.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-300">
                Added ({emails.length})
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700"
                  >
                    <span className="text-sm text-slate-300 truncate">{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg py-2 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={emails.length === 0 || isLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Invites'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;
