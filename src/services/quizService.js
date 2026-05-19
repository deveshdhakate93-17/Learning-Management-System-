import { api } from './authService';

const quizService = {
  getQuizzes: async (filters) => {
    const { data } = await api.get('/quizzes', { params: filters });
    return data;
  },
  getQuizzesBySubject: async (subject) => {
    const { data } = await api.get(`/quizzes/${subject}`);
    return data;
  },
  getQuizById: async (id) => {
    const { data } = await api.get(`/quizzes/id/${id}`);
    return data;
  },
  submitQuiz: async (id, answers) => {
    const { data } = await api.post(`/quizzes/${id}/submit`, { answers });
    return data;
  },
  getUserResults: async () => {
    const { data } = await api.get('/quizzes/user/results');
    return data;
  },
  getLeaderboard: async (quizId) => {
    const { data } = await api.get(`/quizzes/leaderboard/${quizId}`);
    return data;
  },
};

export default quizService;
