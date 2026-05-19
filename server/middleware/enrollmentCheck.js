import Course from '../models/Course.js';

/**
 * Middleware to verify the user is enrolled in the course.
 * Expects courseId in req.params or req.body.
 */
export const enrollmentCheck = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.body.courseId;
    if (!courseId) return res.status(400).json({ message: 'Course ID required' });

    const course = await Course.findById(courseId).select('enrolledUsers');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isEnrolled = course.enrolledUsers.some(
      (uid) => uid.toString() === req.user._id.toString()
    );

    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    req.course = course;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
