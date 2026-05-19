import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text:          { type: String },   // new field name
  question:      { type: String },   // legacy alias
  options:       [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation:   String,
  points:        { type: Number, default: 1 },
}, { _id: true });

const quizSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  slug:         { type: String, unique: true, sparse: true },
  description:  String,
  subject:      { type: String, required: true },
  topic:        { type: String, required: true },
  difficulty:   { type: String, enum: ['Easy', 'Medium', 'Hard', 'beginner', 'intermediate', 'advanced'], default: 'Easy' },
  course:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  questions:    [questionSchema],
  timeLimit:    { type: Number, default: 600 },   // seconds
  passingScore: { type: Number, default: 60 },    // percentage
  isPublished:  { type: Boolean, default: true },
}, { timestamps: true });

quizSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.model('Quiz', quizSchema);
