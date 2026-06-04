import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, AlertCircle, Plus, Trash2, X } from 'lucide-react';
import { studyGroupsAPI } from '../services/api';
import { LoadingSpinner } from '../components/Common';
import Layout from '../components/Layout';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { AddMaterialsModal } from '../components/AddMaterialsModal';
import { useAuthStore } from '../store/auth';

interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    groupId: string;
    userId: string;
    role: string;
    joinedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  sharedFlashcardSets: any[];
  sharedQuizSets: any[];
  owner?: { id: string; name: string; email: string };
}

export const StudyGroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || '';
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddMaterialsModal, setShowAddMaterialsModal] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [removingMaterialId, setRemovingMaterialId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchGroupDetail();
    }
  }, [id]);

  const fetchGroupDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studyGroupsAPI.getGroupDetail(id!);

      // Normalize response
      const groupData = response?.data?.data || response?.data;

      if (groupData && groupData.id) {
        setGroup({
          ...groupData,
          members: groupData.members || [],
          sharedFlashcardSets: groupData.sharedFlashcardSets || [],
          sharedQuizSets: groupData.sharedQuizSets || [],
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Remove this member from the group?')) return;
    try {
      setRemovingMemberId(memberId);
      await studyGroupsAPI.removeGroupMember(id!, memberId);
      fetchGroupDetail();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove member');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleRemoveMaterial = async (materialId: string, type: 'flashcard' | 'quiz') => {
    if (!window.confirm('Remove this material from the group?')) return;
    try {
      setRemovingMaterialId(materialId);
      await studyGroupsAPI.removeMaterialFromGroup(id!, materialId, type);
      fetchGroupDetail();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove material');
    } finally {
      setRemovingMaterialId(null);
    }
  };

  const isOwner = group?.createdBy === userId;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !group) {
    return (
      <Layout>
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900 border border-red-800 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Error Loading Group</h2>
              <p className="text-slate-400 mb-6">{error || 'Group not found'}</p>
              <button
                onClick={() => navigate('/study-groups')}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                Back to Study Groups
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const memberCount = group.members?.length || 0;
  const materialCount = (group.sharedFlashcardSets?.length || 0) + (group.sharedQuizSets?.length || 0);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate('/study-groups')}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-400" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{group.name}</h1>
              {group.description && <p className="text-slate-400">{group.description}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Members</h3>
              </div>
              <p className="text-3xl font-bold text-purple-400">{memberCount}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Materials</h3>
              </div>
              <p className="text-3xl font-bold text-blue-400">{materialCount}</p>
            </div>
          </div>

          {/* Members Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Members</h2>
              {isOwner && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Invite Member
                </button>
              )}
            </div>
            {group.members && group.members.length > 0 ? (
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-white">{member.user.name}</p>
                      <p className="text-sm text-slate-400">{member.user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-purple-600/20 text-purple-300 text-sm rounded-full">
                        {member.role === 'owner' ? 'Owner' : 'Member'}
                      </div>
                      {isOwner && member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          disabled={removingMemberId === member.userId}
                          className="p-2 hover:bg-red-500/10 text-red-400 rounded transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No members yet</p>
            )}
          </div>

          {/* Materials Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Shared Materials</h2>
              {isOwner && (
                <button
                  onClick={() => setShowAddMaterialsModal(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Materials
                </button>
              )}
            </div>

            {group.sharedFlashcardSets && group.sharedFlashcardSets.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Flashcard Sets</h3>
                <div className="space-y-2">
                  {group.sharedFlashcardSets.map((set) => (
                    <div key={set.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{set.title}</p>
                        {set.description && <p className="text-sm text-slate-400">{set.description}</p>}
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => handleRemoveMaterial(set.id, 'flashcard')}
                          disabled={removingMaterialId === set.id}
                          className="ml-3 p-2 hover:bg-red-500/10 text-red-400 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {group.sharedQuizSets && group.sharedQuizSets.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Quiz Sets</h3>
                <div className="space-y-2">
                  {group.sharedQuizSets.map((set) => (
                    <div key={set.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{set.title}</p>
                        {set.description && <p className="text-sm text-slate-400">{set.description}</p>}
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => handleRemoveMaterial(set.id, 'quiz')}
                          disabled={removingMaterialId === set.id}
                          className="ml-3 p-2 hover:bg-red-500/10 text-red-400 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!group.sharedFlashcardSets || group.sharedFlashcardSets.length === 0) &&
             (!group.sharedQuizSets || group.sharedQuizSets.length === 0) && (
              <p className="text-slate-400">No materials added yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {id && (
        <>
          <InviteMemberModal
            isOpen={showInviteModal}
            groupId={id}
            onClose={() => setShowInviteModal(false)}
            onSuccess={() => fetchGroupDetail()}
          />

          <AddMaterialsModal
            isOpen={showAddMaterialsModal}
            groupId={id}
            onClose={() => setShowAddMaterialsModal(false)}
            onSuccess={() => fetchGroupDetail()}
          />
        </>
      )}
    </Layout>
  );
};

export default StudyGroupDetailPage;
