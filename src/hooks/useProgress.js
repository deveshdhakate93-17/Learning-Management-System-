import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchProgress,
  markLectureCompleted,
  saveResumePosition,
  updateLocalProgress,
} from '../store/progressSlice';

const useProgress = () => {
  const dispatch = useDispatch();
  const { progressMap, isLoading, error } = useSelector((s) => s.progress);

  const loadProgress = useCallback(
    (courseId) => dispatch(fetchProgress(courseId)),
    [dispatch]
  );

  const completeLecture = useCallback(
    (courseId, lectureId) => dispatch(markLectureCompleted({ courseId, lectureId })),
    [dispatch]
  );

  const saveResume = useCallback(
    (courseId, lectureId, timestamp) => dispatch(saveResumePosition({ courseId, lectureId, timestamp })),
    [dispatch]
  );

  const updateLocal = useCallback(
    (courseId, lectureId) => dispatch(updateLocalProgress({ courseId, lectureId })),
    [dispatch]
  );

  const getProgress = useCallback(
    (courseId) => progressMap[courseId] || { completedLectures: [], progressPercentage: 0 },
    [progressMap]
  );

  return {
    progressMap,
    isLoading,
    error,
    loadProgress,
    completeLecture,
    saveResume,
    updateLocal,
    getProgress,
  };
};

export default useProgress;
