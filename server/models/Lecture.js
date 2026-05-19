import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  title:            { type: String, required: true },
  order:            { type: Number, default: 0 },
  type:             { type: String, enum: ['video', 'pdf', 'link', 'text'], default: 'video' },
  videoUrl:         String,
  video:            { url: String, publicId: String, duration: Number, durationFormatted: String },
  duration:         { type: Number, default: 0 },   // seconds
  resourceUrl:      String,
  resourceName:     String,
  resources:        [{ name: String, url: String, type: String }],
  description:      String,
  isPreview:        { type: Boolean, default: false },
  isFree:           { type: Boolean, default: false },
  section:          { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  course:           { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
}, { timestamps: true });

export default mongoose.model('Lecture', lectureSchema);
