import { Router } from 'express';
import {
  getNotes,
  getNoteById,
  uploadNote,
  updateNote,
  deleteNote,
  togglePin,
  searchNotes,
  previewFile,
  downloadFile,
} from '../controllers/notesController.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/', limits: { fileSize: 50 * 1024 * 1024 } });
const router = Router();

// ─── CRUD Routes ─────────────────────────────────────────────────────────────
router.get('/', protect, getNotes);
router.get('/search', protect, searchNotes);
router.post('/upload', protect, upload.single('file'), uploadNote);
router.patch('/:id', protect, updateNote);
router.delete('/:id', protect, deleteNote);
router.post('/:id/pin', protect, togglePin);

// ─── File Serving Routes (NEW) ──────────────────────────────────────────────
router.get('/preview/:id', protect, previewFile);    // inline preview
router.get('/download/:id', protect, downloadFile);  // force download
router.get('/:id/detail', protect, getNoteById);     // single note detail

export default router;
