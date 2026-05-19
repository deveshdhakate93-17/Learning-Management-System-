import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  slug:         { type: String, required: true, unique: true },
  subtitle:     String,
  description:  String,
  thumbnail:    { type: mongoose.Schema.Types.Mixed }, // string URL or { url, publicId }
  icon:         { type: String, default: '📚' },
  gradient:     { type: String, default: 'linear-gradient(135deg, #4F46E5, #6366F1)' },
  instructor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category:     { type: String, default: 'General' },
  difficulty:   { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  tags:         [String],
  accessUntil:  { type: Date },
  isPublished:  { type: Boolean, default: true },
  enrolledUsers:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalLectures:{ type: Number, default: 0 },
  totalDuration:{ type: Number, default: 0 },
  sections:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  rating:       { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
}, { timestamps: true });

courseSchema.index({ slug: 1 });
courseSchema.index({ enrolledUsers: 1 });

export default mongoose.model('Course', courseSchema);
