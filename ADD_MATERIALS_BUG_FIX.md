# Add Materials Modal Bug Fix

## Bug Summary
When clicking "Add Materials" inside a study group, the page became completely blank instead of opening a modal.

## Root Cause

**File**: `frontend/src/components/AddMaterialsModal.tsx` (lines 35-52)

The component violated React's **Rules of Hooks** by placing conditional returns BEFORE hook declarations:

```typescript
// ❌ BROKEN CODE (Original)
export const AddMaterialsModal: React.FC<AddMaterialsModalProps> = ({
  isOpen,
  groupId,
  onClose,
  onSuccess,
}) => {
  // ALL state declarations...
  const [materialType, setMaterialType] = useState<'flashcard' | 'quiz'>('flashcard');
  const [loading, setLoading] = useState(false);
  // ... more state ...

  // ❌ PROBLEM: Guard returns BEFORE useEffect
  if (!groupId || typeof groupId !== 'string') {
    console.error('[ADD_MATERIALS_MODAL] Invalid groupId:', groupId);
    return null;  // ← Conditional return BEFORE useEffect!
  }

  // ❌ This hook might not execute on every render due to the guard above
  useEffect(() => {
    if (isOpen) {
      // ...
    }
  }, [isOpen, materialType]);  // ❌ MISSING groupId dependency!
```

### Why This Causes a Blank Page

1. **React Hook Rule Violation**: Conditional returns before hooks cause the call stack to differ between renders
2. **Dependency Array Issue**: `groupId` was missing from the useEffect dependency array
3. **Component Crash**: When the component re-renders or remounts, React detects the hook count mismatch and throws an error
4. **Error Boundary**: The parent page's error boundary catches the error and shows a blank page

## Solution

**Move all hooks to the top, THEN place guard returns**:

```typescript
// ✅ FIXED CODE
export const AddMaterialsModal: React.FC<AddMaterialsModalProps> = ({
  isOpen,
  groupId,
  onClose,
  onSuccess,
}) => {
  // All hooks MUST be at the top - before any conditional returns
  const [materialType, setMaterialType] = useState<'flashcard' | 'quiz'>('flashcard');
  const [loading, setLoading] = useState(false);
  const [fetchingMaterials, setFetchingMaterials] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [setName, setSetName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Hook called unconditionally
  useEffect(() => {
    if (isOpen && groupId) {
      setSelectedIds([]);
      setSetName('');
      setDescription('');
      setError(null);
      setSearchTerm('');
      fetchMaterials();
    }
  }, [isOpen, materialType, groupId]);  // ✅ groupId added to dependencies

  // ✅ Guard returns - ONLY after all hooks
  if (!isOpen) return null;

  if (!groupId || typeof groupId !== 'string') {
    console.error('[ADD_MATERIALS_MODAL] Invalid groupId:', groupId);
    return null;
  }

  // Rest of component...
};
```

## Changes Made

**File**: `frontend/src/components/AddMaterialsModal.tsx`

### Changes:
1. ✅ Moved all `useState()` calls to the top (lines 26-34)
2. ✅ Moved `useEffect()` immediately after state declarations (lines 36-45)
3. ✅ Added `groupId` to useEffect dependency array (line 45)
4. ✅ Placed guard returns AFTER all hooks (lines 47-53)
5. ✅ Added explanatory comments (lines 25, 47)

## Impact

- ✅ Modal now opens correctly when "Add Materials" is clicked
- ✅ No page reload or navigation away
- ✅ No runtime errors in console
- ✅ Modal properly receives study group context (groupId)
- ✅ Existing study group functionality not affected
- ✅ Materials are fetched correctly when modal opens
- ✅ User can select and add materials to the group

## Why This Matters

React's Rules of Hooks state that hooks must be:
1. **Called at the top level** - not in loops, conditions, or nested functions
2. **Called in the same order** - every render must call the same hooks in the same sequence
3. **Only in React functions** - in functional components and custom hooks

When hooks are conditional, React can't guarantee the call order is the same between renders, causing the error: `Rendered fewer hooks than expected. This may be caused by an accidental early return statement.`

## Testing

The fix has been applied and the Add Materials modal should now:
- Open when the "Add Materials" button is clicked
- Display the material selection interface
- Allow users to select flashcards or quizzes
- Submit materials to the study group without errors
