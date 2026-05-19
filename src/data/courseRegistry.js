// ══════════════════════════════════════════════════════════
// src/data/courseRegistry.js
// Central registry mapping course slugs → their data.
// WatchPage uses this to load the right data for any course.
// ══════════════════════════════════════════════════════════

import { courseData, allTopics, TOTAL_TOPICS, COURSE_ID } from './courseData';
import { pythonCourseData, pythonAllTopics, PYTHON_TOTAL_TOPICS, PYTHON_COURSE_ID } from './pythonCourseData';

/**
 * Registry of all courses with timestamp-based YouTube playback.
 * To add a new course:
 *  1. Create a new data file (e.g. javaCourseData.js)
 *  2. Add an entry here with the slug as key
 */
const courseRegistry = {
  'web-development': {
    courseId:     COURSE_ID,
    title:       'Web Development',
    courseData:   courseData,
    allTopics:   allTopics,
    totalTopics: TOTAL_TOPICS,
    lsKey:       'webdev_progress',
  },
  'python-programming': {
    courseId:     PYTHON_COURSE_ID,
    title:       'Python Programming',
    courseData:   pythonCourseData,
    allTopics:   pythonAllTopics,
    totalTopics: PYTHON_TOTAL_TOPICS,
    lsKey:       'python_progress',
  },
};

/**
 * Get course config by slug. Returns null if not found.
 * @param {string} slug — e.g. "web-development" or "python-programming"
 */
export const getCourseBySlug = (slug) => courseRegistry[slug] || null;

/** Get all registered course slugs */
export const getRegisteredSlugs = () => Object.keys(courseRegistry);

export default courseRegistry;
