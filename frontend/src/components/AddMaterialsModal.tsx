import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Loader, AlertCircle, Search } from 'lucide-react';
import { studyGroupsAPI, flashcardsAPI, quizzesAPI } from '../services/api';

interface Material {
  id: string;
  title: string;
  description?: string;
  count?: number;
}

interface AddMaterialsModalProps {
  isOpen: boolean;
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMaterialsModal: React.FC<AddMaterialsModalProps> = ({
  isOpen,
  groupId,
  onClose,
  onSuccess,
}) => {
  const [materialType, setMaterialType] = useState<'flashcard' | 'quiz'>('flashcard');
  const [loading, setLoading] = useState(false);
  const [fetchingMaterials, setFetchingMaterials] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [setName, setSetName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Validate groupId
  if (!groupId || typeof groupId !== 'string') {
    console.error('[ADD_MATERIALS_MODAL] Invalid groupId:', groupId);
    return null;
  }

  if (!isOpen) return null;

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setSetName('');
      setDescription('');
      setError(null);
      setSearchTerm('');
      fetchMaterials();
    }
  }, [isOpen, materialType]);

  const fetchMaterials = async () => {
    try {
      setFetchingMaterials(true);
      setError(null);

      if (materialType === 'flashcard') {
        const response = await flashcardsAPI.getAllFlashcards();
        const data = response?.data?.data || response?.data || [];
        const formatted = Array.isArray(data) ? data.map(f => ({
          id: f.id,
          title: (f.front || f.sourceLectureTitle || 'Flashcard')?.substring(0, 50),
          description: (f.back || '')?.substring(0, 100),
        })) : [];
        setMaterials(formatted);
      } else {
        const response = await quizzesAPI.getAllQuizzes();
        const data = response?.data?.data || response?.data || [];
        const formatted = Array.isArray(data) ? data.map(q => ({
          id: q.id,
          title: `Quiz Score: ${q.score || 0}/${q.total || 0}`,
          description: `Taken: ${q.takenAt ? new Date(q.takenAt).toLocaleDateString() : 'Unknown'}`,
        })) : [];
        setMaterials(formatted);
      }
    } catch (err: any) {
      console.error('Failed to fetch materials:', err);
      setError('Failed to load your materials');
    } finally {
      setFetchingMaterials(false);
    }
  };

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleAddMaterials = useCallback(async () => {
    console.log('[ADD_MATERIALS_BUTTON] Clicked - setName:', setName, 'selectedIds:', selectedIds, 'loading:', loading);

    if (!setName.trim()) {
      setError('Set name is required');
      return;
    }

    if (selectedIds.length === 0) {
      setError('Please select at least one material');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[ADD_MATERIALS_BUTTON] Sending to API - groupId:', groupId, 'materialType:', materialType, 'selectedIds:', selectedIds);

      if (materialType === 'flashcard') {
        const response = await studyGroupsAPI.addFlashcardSetToGroup(
          groupId,
          selectedIds,
          setName,
          description
        );
        console.log('[ADD_MATERIALS_BUTTON] Flashcard API Response:', response);
      } else {
        const response = await studyGroupsAPI.addQuizSetToGroup(
          groupId,
          selectedIds,
          setName,
          description
        );
        console.log('[ADD_MATERIALS_BUTTON] Quiz API Response:', response);
      }

      setSetName('');
      setDescription('');
      setSelectedIds([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[ADD_MATERIALS_BUTTON] Error:', err);
      setError(err.response?.data?.error || 'Failed to add materials');
    } finally {
      setLoading(false);
    }
  }, [groupId, materialType, selectedIds, setName, description, onSuccess, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Add Materials to Group</h2>
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

          {/* Material Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Material Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMaterialType('flashcard');
                  setSelectedIds([]);
                }}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  materialType === 'flashcard'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                } disabled:opacity-50`}
              >
                📚 Flashcards
              </button>
              <button
                type="button"
                onClick={() => {
                  setMaterialType('quiz');
                  setSelectedIds([]);
                }}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  materialType === 'quiz'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                } disabled:opacity-50`}
              >
                ✓ Quizzes
              </button>
            </div>
          </div>

          {/* Set Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Set Name *</label>
            <input
              type="text"
              placeholder="e.g., Chapter 3 Study Materials"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-purple-600/50 disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description (optional)</label>
            <textarea
              placeholder="Add any notes about this material set..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-purple-600/50 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Select {materialType === 'flashcard' ? 'Flashcards' : 'Quizzes'}
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={fetchingMaterials || loading}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-purple-600/50 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Materials List */}
          {fetchingMaterials ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-purple-400 mr-2" />
              <p className="text-slate-300">Loading your materials...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
              <p className="text-slate-400">
                No {materialType === 'flashcard' ? 'flashcards' : 'quizzes'} found. Create some first!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-700 rounded-lg p-2">
              {filteredMaterials.length === 0 ? (
                <p className="text-slate-400 text-sm p-2">No results found</p>
              ) : (
                filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 cursor-pointer transition-colors"
                    onClick={() => handleToggleSelect(material.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(material.id)}
                      onChange={() => handleToggleSelect(material.id)}
                      className="w-4 h-4 accent-purple-600 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{material.title}</p>
                      {material.description && (
                        <p className="text-xs text-slate-400 truncate">{material.description}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Selection Summary */}
          {selectedIds.length > 0 && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-purple-300 text-sm">
                ✓ {selectedIds.length} {materialType === 'flashcard' ? 'flashcard' : 'quiz'}{selectedIds.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {/* Helper Text */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-300 text-sm">
              💡 <strong>Tip:</strong> Select multiple materials to add them all to your study group at once. All group members will have access to these materials.
            </p>
          </div>

          {/* Buttons */}
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
              onClick={handleAddMaterials}
              disabled={loading || selectedIds.length === 0 || setName.trim().length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-blue-600 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Materials
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMaterialsModal;
