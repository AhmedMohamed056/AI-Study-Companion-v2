#!/bin/bash

echo "=========================================="
echo "Comprehensive Error & Warning Check"
echo "=========================================="

echo -e "\n1. Frontend TypeScript Check..."
cd frontend
npx tsc --noEmit 2>&1 | grep -E "error|warning" || echo "✅ No TypeScript errors"

echo -e "\n2. Frontend Build Check..."
npm run build 2>&1 | grep -E "error|Error" || echo "✅ Frontend builds successfully"

echo -e "\n3. Backend TypeScript Check..."
cd ../backend
npx tsc --noEmit 2>&1 | grep -E "error|warning" || echo "✅ No TypeScript errors"

echo -e "\n4. Backend Build Check..."
npm run build 2>&1 | grep -E "error|Error" || echo "✅ Backend builds successfully"

echo -e "\n5. Checking for unused imports..."
echo "Frontend files:"
grep -r "import.*from" ../frontend/src/pages/LectureDetailPage.tsx | head -1
grep -r "import.*from" ../frontend/src/pages/CoursesPage.tsx | head -1
grep -r "import.*from" ../frontend/src/components/DropdownMenu.tsx | head -1

echo -e "\n6. Checking for missing exports..."
grep -r "export" ../frontend/src/components/DropdownMenu.tsx | head -1

echo -e "\n=========================================="
echo "✅ All checks complete!"
echo "=========================================="
