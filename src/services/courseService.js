import { api } from './authService';

const courseService = {
  getEnrolledCourses: async () => {
    const { data } = await api.get('/courses');
    return data;
  },
  getCourseBySlug: async (slug) => {
    const { data } = await api.get(`/courses/${slug}`);
    return data;
  },
  getCurriculum: async (slug) => {
    const { data } = await api.get(`/courses/${slug}/curriculum`);
    return data;
  },
};

export default courseService;
