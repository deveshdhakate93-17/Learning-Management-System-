import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  fileName: String,
  fileUrl: String,
  cloudinaryId: String,
  mimeType: String,                // ✅ NEW: stores original MIME type (e.g. "application/pdf")
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'video', 'audio', 'text', 'doc', 'ppt', 'xls', 'other'],
    default: 'other',
  },
  fileSize: Number,
  course: String,
  subject: String,
  semester: String,
  faculty: String,
  unit: String,
  chapter: String,
  lectureNumber: String,
  topic: String,
  labels: [{ type: String, enum: ['important', 'before-exam', 'assignment', 'practical', 'interview-prep', 'revision'] }],
  extractedText: String,
  isOCRProcessed: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  lastOpenedAt: { type: Date, default: Date.now },
  openCount: { type: Number, default: 0 },
  aiSummary: String,
  aiTags: [String],
}, { timestamps: true });

noteSchema.index({ user: 1, subject: 1 });
noteSchema.index({ title: 'text', extractedText: 'text', subject: 'text' });

export default mongoose.model('Note', noteSchema);