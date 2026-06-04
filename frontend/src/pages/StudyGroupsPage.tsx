import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { studyGroupsAPI } from '../services/api';
import { StudyGroupCard } from '../components/StudyGroupCard';
import { LoadingSpinner } from '../components/Common';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/auth';

interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: Array<{ user: { id: string; name: string; email: string } }>;
  sharedFlashcardSets: any[];
  sharedQuizSets: any[];
}

export const StudyGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || '';

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studyGroupsAPI.getMyGroups();
      // Normalize response: handle both { data: [...] } and direct array
      const groupsData = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setGroups(groupsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load study groups');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      const response = await studyGroupsAPI.createGroup(newGroupName, newGroupDescription);
      const newGroup = response?.data?.data || response?.data;

      // Ensure group has required fields
      if (newGroup && newGroup.id) {
        // Normalize group data with default values
        const normalizedGroup: StudyGroup = {
          ...newGroup,
          members: newGroup.members || [],
          sharedFlashcardSets: newGroup.sharedFlashcardSets || [],
          sharedQuizSets: newGroup.sharedQuizSets || [],
        };
        setGroups([normalizedGroup, ...groups]);
      }

      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateModal(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create group');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      await studyGroupsAPI.deleteGroup(groupId);
      const groupsList = Array.isArray(groups) ? groups : [];
      setGroups(groupsList.filter((g) => g.id !== groupId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete group');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to leave this group?')) {
      return;
    }

    try {
      await studyGroupsAPI.leaveGroup(groupId);
      const groupsList = Array.isArray(groups) ? groups : [];
      setGroups(groupsList.filter((g) => g.id !== groupId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to leave group');
    }
  };

  const groupsList = Array.isArray(groups) ? groups : [];
  const filteredGroups = groupsList.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOwner = (group: StudyGroup) => group.createdBy === userId;

  if (loading) {
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Study Groups</h1>
              <p className="text-slate-400">Collaborate with classmates and share learning materials</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              New Group
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium">Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-12 pr-4 py-3 text-slate-200 placeholder-slate-500 outline-none focus:border-purple-600/50 focus:ring-1 focus:ring-purple-600/20 transition-all"
            />
          </div>

          {/* Create Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-md">
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-bold text-white">Create Study Group</h2>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Group Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Biology 101 Study Crew"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-purple-600/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Description (optional)</label>
                    <textarea
                      placeholder="What's this group about?"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-purple-600/50 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg py-2 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateGroup}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 font-medium transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Groups Grid */}
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg mb-4">
                {groupsList.length === 0 ? 'No study groups yet' : 'No groups match your search'}
              </p>
              {groupsList.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create First Group
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <StudyGroupCard
                  key={group.id}
                  name={group.name}
                  description={group.description}
                  memberCount={group.members?.length || 0}
                  materialCount={(group.sharedFlashcardSets?.length || 0) + (group.sharedQuizSets?.length || 0)}
                  isOwner={isOwner(group)}
                  onClick={() => {
                    window.location.href = `/study-groups/${group.id}`;
                  }}
                  onDelete={() => handleDeleteGroup(group.id)}
                  onLeave={() => handleLeaveGroup(group.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudyGroupsPage;
