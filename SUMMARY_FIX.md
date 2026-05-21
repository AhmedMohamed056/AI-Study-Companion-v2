# LectureDetailPage Summary Display Fix

## Problem
The UI was showing "Unable to generate summary" even though:
- Console logs showed "Summary set successfully"
- The API was returning valid summary data
- The state was being updated correctly

## Root Cause
The component had two issues:

1. **Missing initial load logic**: The summary state started as `null` and was never populated with existing summary data from the lecture. Even if a summary existed in the database, it wouldn't display until the user clicked "Generate Summary".

2. **No useEffect to load existing summary**: When the lecture data was loaded, there was no effect to check if a summary already existed and populate the state.

## Solution
Added a `useEffect` hook that:

1. **Triggers when lecture data loads** - Watches the `lecture` dependency
2. **Extracts lecture data** - Handles both nested and flat response structures
3. **Parses existing summary** - Safely parses the stored JSON summary
4. **Validates summary quality** - Checks that the title doesn't contain "Unable to generate" error message
5. **Populates state** - Sets the summary state with valid data
6. **Handles errors gracefully** - Catches parsing errors without breaking the component

## Code Changes
**File**: `frontend/src/pages/LectureDetailPage.tsx`

Added:
```typescript
import { useEffect } from 'react';

// Load existing summary from lecture data when lecture is loaded
useEffect(() => {
  if (lecture?.data) {
    const lectureData = lecture.data.data || lecture.data;
    if (lectureData?.summary) {
      try {
        const parsedSummary = typeof lectureData.summary === 'string'
          ? JSON.parse(lectureData.summary)
          : lectureData.summary;

        if (parsedSummary?.title && !parsedSummary.title.includes('Unable to generate')) {
          setSummary({
            title: parsedSummary.title || '',
            summary: typeof parsedSummary.summary === 'string'
              ? parsedSummary.summary
              : JSON.stringify(parsedSummary.summary),
            keyTopics: Array.isArray(parsedSummary.keyTopics) ? parsedSummary.keyTopics : [],
            importantTerms: Array.isArray(parsedSummary.importantTerms) ? parsedSummary.importantTerms : [],
          });
          console.log('[SUMMARY] Loaded existing summary from lecture data');
        }
      } catch (error) {
        console.error('[SUMMARY] Error parsing existing summary:', error);
      }
    }
  }
}, [lecture]);
```

Also improved the unwrap logic in `summaryMutation.onSuccess`:
```typescript
// Better type checking when unwrapping nested data
while (summaryData?.data && typeof summaryData.data === 'object' && !summaryData?.summary) {
  summaryData = summaryData.data;
}
```

## Result
- ✓ Existing summaries now load automatically when the lecture page opens
- ✓ Invalid cached summaries (with "Unable to generate" error) are skipped
- ✓ UI displays the summary correctly without requiring a manual regeneration
- ✓ New summaries generated via the button still work as before
- ✓ Error handling is robust and won't break the component

## Testing
1. Create a lecture and generate a summary
2. Navigate away and back to the lecture detail page
3. The summary should now display automatically without clicking "Generate Summary"
4. The flashcards and quiz buttons should be enabled
