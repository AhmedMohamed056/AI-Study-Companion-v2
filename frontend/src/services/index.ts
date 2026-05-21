import api from './api';

export const authService = {
  register: (email: string, password: string, name: string) =>
    api.post('/api/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  logout: () => api.post('/api/auth/logout'),
};

export const courseService = {
  getCourses: () => api.get('/api/courses'),
  createCourse: (title: string, description: string, examDate?: string) =>
    api.post('/api/courses', { title, description, examDate }),
  getCourse: (id: string) => api.get(`/api/courses/${id}`),
  updateCourse: (id: string, data: any) => api.patch(`/api/courses/${id}`, data),
  deleteCourse: (id: string) => api.delete(`/api/courses/${id}`),
};

export const lectureService = {
  getLectures: (courseId: string) => api.get('/api/lectures', { params: { courseId } }),
  uploadLecture: (courseId: string, title: string, file: File) => {
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('title', title);
    formData.append('file', file);
    return api.post('/api/lectures/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getLecture: (id: string) => api.get(`/api/lectures/${id}`),
  getSummary: (id: string) => api.get(`/api/lectures/${id}/summary`),
  updateLecture: (id: string, data: any) => api.patch(`/api/lectures/${id}`, data),
  deleteLecture: (id: string) => api.delete(`/api/lectures/${id}`),
};

export const flashcardService = {
  getFlashcards: (lectureId: string) => api.get('/api/flashcards', { params: { lectureId } }),
  getDueFlashcards: () => api.get('/api/flashcards/due'),
  generateFlashcards: (lectureId: string) => api.post('/api/flashcards/generate', { lectureId }),
  reviewFlashcard: (id: string, ease: 'easy' | 'hard' | 'again') =>
    api.patch(`/api/flashcards/${id}/review`, { ease }),
  deleteFlashcard: (id: string) => api.delete(`/api/flashcards/${id}`),
};

export const quizService = {
  generateQuiz: (lectureId: string) => api.post('/api/quiz/generate', { lectureId }),
  submitQuiz: (lectureId: string, answers: any[]) =>
    api.post('/api/quiz/submit', { lectureId, answers }),
  getHistory: () => api.get('/api/quiz/history'),
};

export const analyticsService = {
  getAnalytics: () => api.get('/api/analytics/me'),
};

export const noteService = {
  getNotes: (lectureId: string) => api.get(`/api/notes/${lectureId}`),
  createNote: (lectureId: string, content: string) =>
    api.post(`/api/notes/${lectureId}`, { content }),
  updateNote: (noteId: string, content: string) =>
    api.patch(`/api/notes/${noteId}`, { content }),
  deleteNote: (noteId: string) => api.delete(`/api/notes/${noteId}`),
};
