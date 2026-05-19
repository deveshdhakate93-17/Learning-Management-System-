import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { fetchCourses, fetchCourseBySlug, clearCurrentCourse } from '../store/courseSlice';

const useCourses = () => {
  const dispatch = useDispatch();
  const { courses, currentCourse, isLoading, error } = useSelector((s) => s.courses);

  const loadCourses = useCallback(() => dispatch(fetchCourses()), [dispatch]);

  const loadCourseBySlug = useCallback(
    (slug) => dispatch(fetchCourseBySlug(slug)),
    [dispatch]
  );

  const resetCurrentCourse = useCallback(
    () => dispatch(clearCurrentCourse()),
    [dispatch]
  );

  return {
    courses,
    currentCourse,
    isLoading,
    error,
    loadCourses,
    loadCourseBySlug,
    resetCurrentCourse,
  };
};

export default useCourses;
