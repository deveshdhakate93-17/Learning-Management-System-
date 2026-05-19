import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLectures: [{
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
    completedAt: { type: Date, default: Date.now },
    watchedPercentage: { type: Number, default: 100 },
  }],
  lastWatched: {
    lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
    timestamp: { type: Number, default: 0 },
    watchedAt: { type: Date, default: Date.now },
  },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  certificateIssued: { type: Boolean, default: false },
}, { timestamps: true });

userProgressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('UserProgress', userProgressSchema);
