import Note from '../models/Note.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── MIME type map ───────────────────────────────────────────────────────────
const MIME_MAP = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
  '.rar': 'application/x-rar-compressed',
};

const getMimeType = (filename = '') => {
  const ext = path.extname(filename).toLowerCase();
  return MIME_MAP[ext] || 'application/octet-stream';
};

// ─── mimetype → Note model fileType ──────────────────────────────────────────
const getFileType = (mimetype = '') => {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype === 'text/plain' || mimetype === 'text/csv') return 'text';
  if (mimetype.includes('word') || mimetype.includes('document')) return 'doc';
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'ppt';
  if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return 'xls';
  return 'other';
};

// ─── mimetype → Cloudinary resource_type ─────────────────────────────────────
const getResourceType = (mimetype = '') => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/') || mimetype.startsWith('audio/')) return 'video';
  return 'raw';
};

// ═══════════════════════════════════════════════════════════════════════════════
//  CRUD Operations
// ═══════════════════════════════════════════════════════════════════════════════

export const getNotes = async (req, res) => {
  try {
    const filter = { user: req.user._id, isArchived: false };
    if (req.query.course) filter.course = req.query.course;
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.label) filter.labels = req.query.label;
    const notes = await Note.find(filter).sort({ isPinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadNote = async (req, res) => {
  try {
    const { title, course, subject, semester, labels } = req.body;

    if (!req.file) return res.status(400).json({ message: 'File required hai' });
    if (!title?.trim()) return res.status(400).json({ message: 'Title required hai' });

    const resourceType = getResourceType(req.file.mimetype);
    const fileType = getFileType(req.file.mimetype);

    // ✅ Cloudinary upload
    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'lms_notes',
        resource_type: resourceType,
        public_id: `note_${req.user._id}_${Date.now()}`,
        use_filename: true,
      });
    } catch (cloudErr) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: `Cloudinary error: ${cloudErr.message}` });
    }

    // ✅ Temp file delete
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    // ✅ DB mein save
    const note = await Note.create({
      user: req.user._id,
      title: title.trim(),
      course: course || '',
      subject: subject || course || '',
      semester: semester || '',
      labels: labels ? JSON.parse(labels) : [],
      fileType,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      mimeType: req.file.mimetype,
    });

    res.status(201).json(note);
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // ✅ Cloudinary se bhi delete karo
    if (note.cloudinaryId) {
      const resourceType = getResourceType(note.mimeType || (note.fileType === 'image' ? 'image/' : 'application/pdf'));
      try {
        await cloudinary.uploader.destroy(note.cloudinaryId, { resource_type: resourceType });
      } catch (e) {
        console.warn('Cloudinary delete warning:', e.message);
      }
    }

    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    note.isPinned = !note.isPinned;
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const searchNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user._id,
      isArchived: false,
      $or: [
        { title: { $regex: req.query.q, $options: 'i' } },
        { subject: { $regex: req.query.q, $options: 'i' } },
        { course: { $regex: req.query.q, $options: 'i' } },
      ],
    }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  FILE PREVIEW — streams from Cloudinary with Content-Disposition: inline
// ═══════════════════════════════════════════════════════════════════════════════
export const previewFile = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.fileUrl) return res.status(404).json({ message: 'No file attached' });

    const mimeType = note.mimeType || getMimeType(note.fileName);
    const fileName = note.fileName || 'file';

    // For Cloudinary-hosted files, proxy the file to set correct headers
    const fileUrl = note.fileUrl;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Stream from Cloudinary
    const protocol = fileUrl.startsWith('https') ? https : http;
    protocol.get(fileUrl, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        return res.status(502).json({ message: 'Failed to fetch file from storage' });
      }
      if (proxyRes.headers['content-length']) {
        res.setHeader('Content-Length', proxyRes.headers['content-length']);
      }
      proxyRes.pipe(res);
    }).on('error', (err) => {
      console.error('Proxy stream error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming file' });
      }
    });

    // Update open count
    Note.updateOne(
      { _id: note._id },
      { $inc: { openCount: 1 }, lastOpenedAt: new Date() }
    ).catch(() => {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  FILE DOWNLOAD — streams from Cloudinary with Content-Disposition: attachment
// ═══════════════════════════════════════════════════════════════════════════════
export const downloadFile = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.fileUrl) return res.status(404).json({ message: 'No file attached' });

    const mimeType = note.mimeType || getMimeType(note.fileName);
    const fileName = note.fileName || 'file';

    const fileUrl = note.fileUrl;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const protocol = fileUrl.startsWith('https') ? https : http;
    protocol.get(fileUrl, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        return res.status(502).json({ message: 'Failed to fetch file from storage' });
      }
      if (proxyRes.headers['content-length']) {
        res.setHeader('Content-Length', proxyRes.headers['content-length']);
      }
      proxyRes.pipe(res);
    }).on('error', (err) => {
      console.error('Download stream error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  GET NOTE BY ID — for fetching single note details
// ═══════════════════════════════════════════════════════════════════════════════
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};