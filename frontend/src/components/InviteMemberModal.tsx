import React, { useState, useCallback } from 'react';
import { X, Mail, AlertCircle, CheckCircle, Loader, Plus } from 'lucide-react';
import { studyGroupsAPI } from '../services/api';

interface InviteMemberModalProps {
  isOpen: boolean;
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  groupId,
  onClose,
  onSuccess,
}) => {
  // ✅ ALL HOOKS FIRST
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  // ✅ Add email - works with both Enter key and button click
  const handleAddEmail = useCallback(() => {
    console.log('[ADD_EMAIL] Called - emailInput:', emailInput, 'current emails:', emails);

    const email = emailInput.trim().toLowerCase();

    // Validation
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Invalid email format. Please enter a valid email address.');
      return;
    }

    if (emails.includes(email)) {
      setError('This email is already added');
      return;
    }

    if (emails.length >= 50) {
      setError('Maximum 50 emails per invitation');
      return;
    }

    // Add email to array
    console.log('[ADD_EMAIL] Adding email:', email);
    setEmails(prev => {
      console.log('[ADD_EMAIL] Previous emails:', prev);
      const updated = [...prev, email];
      console.log('[ADD_EMAIL] Updated emails:', updated);
      return updated;
    });

    // Clear input and errors
    setEmailInput('');
    setError(null);
  }, [emailInput, emails]);

  // ✅ Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  // ✅ Remove email from list
  const handleRemoveEmail = useCallback((emailToRemove: string) => {
    setEmails(prev => prev.filter(e => e !== emailToRemove));
  }, []);

  // ✅ Send invitations
  const handleInvite = useCallback(async () => {
    console.log('[INVITE] Clicked - emails:', emails, 'groupId:', groupId);

    if (emails.length === 0) {
      setError('Please add at least one email');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('[INVITE] Sending invitations - groupId:', groupId, 'emails:', emails);

      const response = await studyGroupsAPI.inviteUsers(groupId, undefined, emails);

      console.log('[INVITE] Success:', response);

      setSuccess(`Successfully invited ${emails.length} member${emails.length > 1 ? 's' : ''}! Invitations sent via email.`);
      setEmails([]);
      setEmailInput('');

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('[INVITE] Error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to invite members';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [groupId, emails, onSuccess, onClose]);

  // ✅ Validate inputs for button disabled state
  const canInvite = emails.length > 0 && !loading;
  const canAddEmail = emailInput.trim().length > 0 && !loading;

  // ✅ Check conditions AFTER hooks
  if (!isOpen) {
    return null;
  }

  if (!groupId || typeof groupId !== 'string') {
    console.error('[INVITE_MODAL] Invalid groupId:', groupId);
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Invite Members</h2>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="p-1 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              title="Close"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Email Input Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (error) setError(null);  // Clear error on input change
                  }}
                  onKeyDown={handleKeyPress}
                  disabled={loading}
                  maxLength={254}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-purple-600/50 disabled:opacity-50 transition-colors"
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                onClick={handleAddEmail}
                disabled={!canAddEmail}
                title="Add email (or press Enter)"
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Press Enter or click "Add" button to add email
            </p>
          </div>

          {/* Added Emails List */}
          {emails.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Added Emails</label>
                <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                  {emails.length} added
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                      <span className="text-sm text-slate-200 truncate">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      disabled={loading}
                      className="p-1 hover:bg-slate-700 rounded transition-colors disabled:opacity-50 flex-shrink-0 ml-2"
                      title="Remove email"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              ℹ️ Each invited member will receive an email with a 7-day link to join the group. They can accept using their existing account.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg py-2 font-medium transition-colors disabled:opacity-50 disabled:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInvite}
              disabled={!canInvite}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-purple-600 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Invite {emails.length > 0 && `(${emails.length})`}
                </>
              )}
            </button>
          </div>

          {/* Email Count Indicator */}
          {emails.length > 0 && (
            <div className="text-center text-xs text-slate-400">
              {emails.length} of 50 emails added
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
