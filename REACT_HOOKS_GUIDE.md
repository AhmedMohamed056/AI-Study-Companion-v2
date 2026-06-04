# React Hooks Rules - Complete Guide & Best Practices

## 🚨 The Error Explained

### Error Message:
```
Warning: React has detected a change in the order of Hooks called by InviteMemberModal.
Uncaught Error: Rendered more hooks than during the previous render.
```

### What This Means:
React uses a **hook call order** to match state to component instances. If the number or order of hooks changes between renders, React loses track of which state belongs where.

## ❌ What Caused the Error

```tsx
// ❌ WRONG - Hooks called AFTER conditional return
export const InviteMemberModal = ({ isOpen, groupId, onClose, onSuccess }) => {
  // ❌ Problem: These early returns skip all hooks below
  if (!groupId) return null;           // If true → hooks NEVER called
  if (!isOpen) return null;            // If true → hooks NEVER called

  // ❌ These hooks are only called if above conditions are false
  const [emailInput, setEmailInput] = useState('');      // Hook 1
  const [emails, setEmails] = useState([]);              // Hook 2
  const handleInvite = useCallback(...);                 // Hook 3
  
  return <div>...</div>;
};
```

**Scenario showing the error:**

| Render | isOpen | groupId | Hooks Called | Problem |
|--------|--------|---------|--------------|---------|
| 1st    | true   | "valid" | 3 hooks      | ✅ OK |
| 2nd    | false  | "valid" | 0 hooks      | ❌ ERROR: Changed from 3 to 0 |
| 3rd    | true   | "valid" | 3 hooks      | ❌ ERROR: Changed from 0 to 3 |

## ✅ The Fix: Always Call Hooks First

```tsx
// ✅ CORRECT - All hooks called BEFORE any conditionals
export const InviteMemberModal = ({ isOpen, groupId, onClose, onSuccess }) => {
  // ✅ Step 1: Declare ALL hooks first (before any logic)
  const [emailInput, setEmailInput] = useState('');      // Hook 1
  const [emails, setEmails] = useState([]);              // Hook 2
  const [loading, setLoading] = useState(false);         // Hook 3
  const [error, setError] = useState(null);              // Hook 4
  
  const handleInvite = useCallback(async () => {         // Hook 5
    // logic here
  }, [groupId, emails, onSuccess, onClose]);

  // ✅ Step 2: NOW you can check conditions
  if (!isOpen) return null;      // Now it's safe
  if (!groupId) return null;     // All hooks already declared

  // ✅ Step 3: Render
  return <div>...</div>;
};
```

**Why this works:**

| Render | isOpen | groupId | Hooks Called | Result |
|--------|--------|---------|--------------|--------|
| 1st    | true   | "valid" | 5 hooks      | ✅ OK |
| 2nd    | false  | "valid" | 5 hooks      | ✅ OK - Same number! |
| 3rd    | true   | "valid" | 5 hooks      | ✅ OK - Consistent! |

## 📋 The Rules of Hooks (React Official)

### Rule 1: Call Hooks at the Top Level
✅ **DO:**
```tsx
function Component() {
  const [count, setCount] = useState(0);  // Top level ✅
  return <div>{count}</div>;
}
```

❌ **DON'T:**
```tsx
function Component() {
  if (someCondition) {
    const [count, setCount] = useState(0);  // Inside if ❌
  }
  return <div></div>;
}
```

### Rule 2: Call Hooks in the Same Order
✅ **DO:**
```tsx
function Component({ condition }) {
  const [a, setA] = useState(0);     // Always called
  const [b, setB] = useState(0);     // Always called
  return <div>{a + b}</div>;
}
```

❌ **DON'T:**
```tsx
function Component({ condition }) {
  const [a, setA] = useState(0);           // Always called
  if (condition) {
    const [b, setB] = useState(0);         // Sometimes called ❌
  }
  return <div></div>;
}
```

### Rule 3: Only Call Hooks from React Functions
✅ **DO:**
```tsx
function Component() {
  const [count, setCount] = useState(0);  // Inside component ✅
  return <button>{count}</button>;
}
```

❌ **DON'T:**
```tsx
function regularFunction() {
  const [count, setCount] = useState(0);  // Not in component ❌
}
```

## 🛠️ Debugging Steps

### Step 1: Check the Component Tree
Open React DevTools → Components tab
- Look for the component with the error
- Check if parent props changed between renders

### Step 2: Review Your Render Path
```tsx
// Add console.logs to see execution order
export const MyComponent = ({ isOpen }) => {
  console.log('1. Component renders, isOpen:', isOpen);
  
  // Check if any hooks are skipped
  if (isOpen) {
    console.log('2. isOpen is true, continuing...');
  } else {
    console.log('2. isOpen is false, returning early!');  // ❌ Hooks skipped!
    return null;
  }

  const [state, setState] = useState(0);
  console.log('3. Hooks declared');
  
  return <div>{state}</div>;
};
```

### Step 3: Look for Conditional Hook Calls
Search for these patterns:
```tsx
// ❌ Pattern 1: return before hooks
if (condition) return null;
const [state, setState] = useState(); // ❌

// ❌ Pattern 2: hooks inside if
if (condition) {
  const [state, setState] = useState(); // ❌
}

// ❌ Pattern 3: conditional hook type
const hook = condition ? useState() : useEffect(); // ❌

// ❌ Pattern 4: loop with hooks
for (let i = 0; i < count; i++) {
  const [state, setState] = useState(); // ❌
}
```

## 📝 Best Practices for Avoiding This Error

### 1. Always Declare Hooks First
```tsx
export const Component = (props) => {
  // ✅ Section 1: All hooks
  const [state, setState] = useState();
  const [data, setData] = useState();
  const memoized = useMemo(() => compute(), [state]);
  
  // ✅ Section 2: Helper functions
  const handleClick = () => {
    setState(prev => prev + 1);
  };
  
  // ✅ Section 3: Conditionals
  if (!props.isVisible) return null;
  
  // ✅ Section 4: Render
  return <div>{state}</div>;
};
```

### 2. Use Conditional Logic Inside Effects/Callbacks
```tsx
// ✅ GOOD: Hook always called, logic inside
function Component({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    if (!userId) {  // ✅ Condition inside effect
      setUser(null);
      return;
    }
    
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  return <div>{user?.name}</div>;
}
```

### 3. Extract Conditional Logic to Custom Hooks
```tsx
// ✅ If you need conditional behavior, create a custom hook
function useConditionalData(condition, getData) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    if (!condition) {
      setData(null);
      return;
    }
    
    getData().then(setData);
  }, [condition, getData]);
  
  return data;
}

// Usage - hooks always called
function Component({ enabled, userId }) {
  const data = useConditionalData(enabled, () => fetchData(userId));
  return <div>{data}</div>;
}
```

### 4. Type-Safe Hooks Pattern
```tsx
// ✅ TypeScript helps catch hook order issues
import { useState, useCallback, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  groupId: string;
  onClose: () => void;
}

export const Modal: React.FC<Props> = ({ isOpen, groupId, onClose }) => {
  // All hooks declared first
  const [state, setState] = useState('');
  const handleSubmit = useCallback(() => {
    // logic
  }, [groupId]);

  // Then conditionals
  if (!isOpen) return null;

  return <div>...</div>;
};
```

## 🧪 Testing: Verify Hook Consistency

```tsx
// Test with different props to ensure hook count never changes
describe('MyComponent', () => {
  it('should not change hook count based on props', () => {
    const { rerender } = render(
      <Component isOpen={true} groupId="123" />
    );
    
    // Re-render with different props
    rerender(
      <Component isOpen={false} groupId="123" />  // Should NOT error
    );
    
    rerender(
      <Component isOpen={true} groupId={null} />  // Should NOT error
    );
  });
});
```

## 🎯 Quick Reference Card

### ❌ NEVER DO:
```tsx
// Conditional returns before hooks
if (x) return null;
useState();

// Hooks in conditionals
if (condition) { useState(); }

// Hooks in loops
for (let i = 0; i < n; i++) { useState(); }

// Conditional hook calls
condition ? useState() : null;
```

### ✅ ALWAYS DO:
```tsx
// Declare all hooks first
const [state, setState] = useState();
const effect = useEffect(() => {}, []);

// Then check conditions
if (condition) return null;

// Use conditionals inside hooks
useEffect(() => {
  if (condition) { /* ... */ }
}, []);

// Or extract to custom hook
const value = useCustomHook();
```

## 🔗 Related Issues

If you get this error in **AddMaterialsModal** too, apply the same fix:
- Move all `useState` to the top
- Move `useCallback` to the top
- Move `useEffect` to the top
- Then add validation/conditional checks

## 📚 Resources

- [React Hooks Rules - Official Docs](https://react.dev/reference/rules/rules-of-hooks)
- [React DevTools Debugger](https://react.dev/learn/react-developer-tools)
- [Common Mistakes with Hooks](https://react.dev/learn/state-a-components-memory#meet-your-first-hook)

---

## Summary

**The Error:** Hooks called in different order between renders
**The Cause:** Conditional returns before hook declarations
**The Fix:** Always declare hooks first, then check conditions
**The Pattern:** Hooks → Helpers → Conditionals → Render

Now your modals should work without errors! ✅
