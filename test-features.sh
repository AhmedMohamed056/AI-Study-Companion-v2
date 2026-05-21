#!/bin/bash

# Test script for Lecture Notes and Three-dot Menu features
# This script tests all the new endpoints and functionality

BASE_URL="http://localhost:3000/api"
FRONTEND_URL="http://localhost:5173"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Testing Lecture Notes & Three-dot Menu Features"
echo "=========================================="

# Test 1: Create a test user and get auth token
echo -e "\n${YELLOW}Test 1: User Registration${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to register user${NC}"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi
echo -e "${GREEN}✓ User registered successfully${NC}"
echo "Token: ${TOKEN:0:20}..."

# Test 2: Create a course
echo -e "\n${YELLOW}Test 2: Create Course${NC}"
COURSE_RESPONSE=$(curl -s -X POST "$BASE_URL/courses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Course",
    "description": "A test course for feature testing",
    "examDate": "2026-06-15"
  }')

COURSE_ID=$(echo $COURSE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
if [ -z "$COURSE_ID" ]; then
  echo -e "${RED}Failed to create course${NC}"
  echo "Response: $COURSE_RESPONSE"
  exit 1
fi
echo -e "${GREEN}✓ Course created: $COURSE_ID${NC}"

# Test 3: Update course (three-dot menu feature)
echo -e "\n${YELLOW}Test 3: Update Course (Edit Feature)${NC}"
UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/courses/$COURSE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Updated Test Course",
    "description": "Updated description"
  }')

UPDATED_TITLE=$(echo $UPDATE_RESPONSE | grep -o '"title":"[^"]*' | cut -d'"' -f4)
if [ "$UPDATED_TITLE" = "Updated Test Course" ]; then
  echo -e "${GREEN}✓ Course updated successfully${NC}"
else
  echo -e "${RED}Failed to update course${NC}"
  echo "Response: $UPDATE_RESPONSE"
fi

# Test 4: Create a lecture (mock)
echo -e "\n${YELLOW}Test 4: Create Lecture (Mock)${NC}"
# Since we can't upload a real PDF, we'll create a lecture directly in the database
# For testing purposes, we'll use a curl command to create a lecture
LECTURE_RESPONSE=$(curl -s -X POST "$BASE_URL/lectures/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "courseId=$COURSE_ID" \
  -F "title=Test Lecture" \
  -F "file=@/dev/null")

# Extract lecture ID from response (this might fail if file is required)
LECTURE_ID=$(echo $LECTURE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
if [ -z "$LECTURE_ID" ]; then
  echo -e "${YELLOW}Note: Lecture creation requires a real PDF file${NC}"
  echo "Skipping lecture-dependent tests"
  SKIP_LECTURE_TESTS=true
else
  echo -e "${GREEN}✓ Lecture created: $LECTURE_ID${NC}"
fi

# Test 5: Create a note (if lecture exists)
if [ -z "$SKIP_LECTURE_TESTS" ]; then
  echo -e "\n${YELLOW}Test 5: Create Note${NC}"
  NOTE_RESPONSE=$(curl -s -X POST "$BASE_URL/notes/$LECTURE_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "content": "This is a test note for the lecture"
    }')

  NOTE_ID=$(echo $NOTE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  if [ -n "$NOTE_ID" ]; then
    echo -e "${GREEN}✓ Note created: $NOTE_ID${NC}"
  else
    echo -e "${RED}Failed to create note${NC}"
    echo "Response: $NOTE_RESPONSE"
  fi

  # Test 6: Get notes
  echo -e "\n${YELLOW}Test 6: Get Notes${NC}"
  NOTES_RESPONSE=$(curl -s -X GET "$BASE_URL/notes/$LECTURE_ID" \
    -H "Authorization: Bearer $TOKEN")

  NOTES_COUNT=$(echo $NOTES_RESPONSE | grep -o '"id"' | wc -l)
  if [ $NOTES_COUNT -gt 0 ]; then
    echo -e "${GREEN}✓ Retrieved $NOTES_COUNT note(s)${NC}"
  else
    echo -e "${RED}Failed to retrieve notes${NC}"
  fi

  # Test 7: Update note
  echo -e "\n${YELLOW}Test 7: Update Note${NC}"
  UPDATE_NOTE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/notes/$NOTE_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "content": "Updated note content"
    }')

  UPDATED_CONTENT=$(echo $UPDATE_NOTE_RESPONSE | grep -o '"content":"[^"]*' | cut -d'"' -f4)
  if [ "$UPDATED_CONTENT" = "Updated note content" ]; then
    echo -e "${GREEN}✓ Note updated successfully${NC}"
  else
    echo -e "${RED}Failed to update note${NC}"
  fi

  # Test 8: Delete note
  echo -e "\n${YELLOW}Test 8: Delete Note${NC}"
  DELETE_NOTE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/notes/$NOTE_ID" \
    -H "Authorization: Bearer $TOKEN")

  if echo $DELETE_NOTE_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Note deleted successfully${NC}"
  else
    echo -e "${RED}Failed to delete note${NC}"
  fi

  # Test 9: Update lecture (three-dot menu feature)
  echo -e "\n${YELLOW}Test 9: Update Lecture (Edit Feature)${NC}"
  UPDATE_LECTURE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/lectures/$LECTURE_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "title": "Updated Lecture Title"
    }')

  UPDATED_LECTURE_TITLE=$(echo $UPDATE_LECTURE_RESPONSE | grep -o '"title":"[^"]*' | cut -d'"' -f4)
  if [ "$UPDATED_LECTURE_TITLE" = "Updated Lecture Title" ]; then
    echo -e "${GREEN}✓ Lecture updated successfully${NC}"
  else
    echo -e "${RED}Failed to update lecture${NC}"
  fi

  # Test 10: Delete lecture
  echo -e "\n${YELLOW}Test 10: Delete Lecture${NC}"
  DELETE_LECTURE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/lectures/$LECTURE_ID" \
    -H "Authorization: Bearer $TOKEN")

  if echo $DELETE_LECTURE_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Lecture deleted successfully${NC}"
  else
    echo -e "${RED}Failed to delete lecture${NC}"
  fi
fi

# Test 11: Delete course
echo -e "\n${YELLOW}Test 11: Delete Course${NC}"
DELETE_COURSE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/courses/$COURSE_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo $DELETE_COURSE_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Course deleted successfully${NC}"
else
  echo -e "${RED}Failed to delete course${NC}"
fi

echo -e "\n=========================================="
echo -e "${GREEN}Testing Complete!${NC}"
echo "=========================================="
echo -e "\nFrontend URL: ${FRONTEND_URL}"
echo "You can now test the UI features manually"
