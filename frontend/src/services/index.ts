import api from './api';

export const authService = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
};

export const courseService = {
  getCourses: () => api.get('/courses'),
  createCourse: (title: string, description: string, examDate?: string) =>
    api.post('/courses', { title, description, examDate }),
  getCourse: (id: string) => api.get(`/courses/${id}`),
  updateCourse: (id: string, data: any) => api.patch(`/courses/${id}`, data),
  deleteCourse: (id: string) => api.delete(`/courses/${id}`),
};

export const lectureService = {
  getLectures: (courseId: string) => api.get('/lectures', { params: { courseId } }),
  uploadLecture: (courseId: string, title: string, file: File) => {
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('title', title);
    formData.append('file', file);
    return api.post('/lectures/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getLecture: (id: string) => api.get(`/lectures/${id}`),
  getSummary: (id: string) => api.get(`/lectures/${id}/summary`),
  updateLecture: (id: string, data: any) => api.patch(`/lectures/${id}`, data),
  deleteLecture: (id: string) => api.delete(`/lectures/${id}`),
};

export const flashcardService = {
  getFlashcards: (lectureId: string) => api.get('/flashcards', { params: { lectureId } }),
  getDueFlashcards: () => api.get('/flashcards/due'),
  generateFlashcards: (lectureId: string) => api.post('/flashcards/generate', { lectureId }),
  reviewFlashcard: (id: string, ease: 'easy' | 'hard' | 'again') =>
    api.patch(`/flashcards/${id}/review`, { ease }),
  deleteFlashcard: (id: string) => api.delete(`/flashcards/${id}`),
};

export const quizService = {
  generateQuiz: (lectureId: string) => api.post('/quiz/generate', { lectureId }),
  submitQuiz: (lectureId: string, answers: any[]) =>
    api.post('/quiz/submit', { lectureId, answers }),
  getHistory: () => api.get('/quiz/history'),
};

export const analyticsService = {
  getAnalytics: () => api.get('/analytics/me'),
};

export const noteService = {
  getNotes: (lectureId: string) => api.get(`/notes/${lectureId}`),
  createNote: (lectureId: string, content: string) =>
    api.post(`/notes/${lectureId}`, { content }),
  updateNote: (noteId: string, content: string) =>
    api.patch(`/notes/${noteId}`, { content }),
  deleteNote: (noteId: string) => api.delete(`/notes/${noteId}`),
};

export const studyPlanService = {
  generateStudyPlan: (examDate: string) =>
    api.post('/study-plans/generate', { examDate }),
};
