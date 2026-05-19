import Course from '../models/Course.js';
import UserProgress from '../models/UserProgress.js';

// ── Student: get enrolled courses with progress ──────────────────────────────
export const getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({ enrolledUsers: req.user._id, isPublished: true })
      .select('-enrolledUsers')
      .lean();

    // Attach progress data
    const progressDocs = await UserProgress.find({ user: req.user._id }).lean();
    const progressMap = {};
    progressDocs.forEach(p => { progressMap[p.course.toString()] = p; });

    const enriched = courses.map(c => {
      const p = progressMap[c._id.toString()];
      return {
        ...c,
        progress: p?.progressPercentage || 0,
        completedLectures: p?.completedLectures?.length || 0,
        lastWatched: p?.lastWatched || null,
      };
    });

    res.json(enriched);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Get course by slug (with sections & lectures) ─────────────────────────────
export const getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isPublished: true })
      .populate({ path: 'sections', populate: { path: 'lectures' } })
      .populate('instructor', 'fullName avatar');

    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Admin: create course ──────────────────────────────────────────────────────
export const createCourse = async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, instructor: req.user._id, createdBy: req.user._id });
    res.status(201).json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Admin: update course ──────────────────────────────────────────────────────
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Admin: delete course ──────────────────────────────────────────────────────
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Admin: list all courses ───────────────────────────────────────────────────
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate('instructor', 'fullName').lean();
    res.json(courses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Enroll user in a course ───────────────────────────────────────────────────
export const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.enrolledUsers.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled' });
    }
    course.enrolledUsers.push(req.user._id);
    await course.save();
    res.json({ message: 'Enrolled successfully', courseId: course._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
