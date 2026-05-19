import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  order:    { type: Number, default: 0 },
  lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
  course:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
}, { timestamps: true });

export default mongoose.model('Section', sectionSchema);
