import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, HardDrive, Calendar, Star, Upload, Search, Grid, List,
  Trash2, Pin, ChevronDown, ChevronRight, Folder, X, Clock, Download,
  Eye, Image, Film, Music, FileSpreadsheet, Presentation, File
} from 'lucide-react';
import toast from 'react-hot-toast';
import useNotes from '../hooks/useNotes';
import notesService from '../services/notesService';
import FilePreview from '../components/notes/FilePreview';

const labelConfig = {
  important: { color: '#EF4444', icon: '⭐', label: 'Important' },
  'before-exam': { color: '#F59E0B', icon: '📝', label: 'Before Exam' },
  revision: { color: '#3B82F6', icon: '🔁', label: 'Revision' },
  assignment: { color: '#8B5CF6', icon: '📌', label: 'Assignment' },
  practical: { color: '#10B981', icon: '💻', label: 'Practical' },
  'interview-prep': { color: '#F97316', icon: '🎯', label: 'Interview Prep' },
};

const sidebarTree = [
  { label: 'Web Development', children: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'] },
  { label: 'AI/ML', children: ['Neural Networks', 'Deep Learning', 'NLP'] },
  { label: 'Python', children: ['OOP', 'Data Types', 'Libraries'] },
  { label: 'DSA', children: ['Arrays', 'Trees', 'Graphs', 'DP'] },
];

const PRESET_COURSES = ['Web Development', 'AI/ML', 'Python', 'DSA'];

// ─── File type icon helper ───────────────────────────────────────────────────
const getFileIcon = (note) => {
  const { fileType, fileName = '' } = note;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (fileType === 'pdf' || ext === 'pdf') return { Icon: FileText, color: '#EF4444' };
  if (fileType === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return { Icon: Image, color: '#10B981' };
  if (fileType === 'video' || ['mp4', 'webm', 'ogg'].includes(ext)) return { Icon: Film, color: '#8B5CF6' };
  if (fileType === 'audio' || ['mp3', 'wav'].includes(ext)) return { Icon: Music, color: '#F59E0B' };
  if (fileType === 'doc' || ['doc', 'docx'].includes(ext)) return { Icon: FileText, color: '#2563EB' };
  if (fileType === 'ppt' || ['ppt', 'pptx'].includes(ext)) return { Icon: Presentation, color: '#F97316' };
  if (fileType === 'xls' || ['xls', 'xlsx'].includes(ext)) return { Icon: FileSpreadsheet, color: '#059669' };
  if (fileType === 'text' || ['txt', 'csv'].includes(ext)) return { Icon: FileText, color: '#6B7280' };
  return { Icon: File, color: '#4F46E5' };
};

// ─── File type badge label ───────────────────────────────────────────────────
const getFileTypeLabel = (note) => {
  const ext = note.fileName?.split('.').pop()?.toUpperCase() || '';
  return ext || note.fileType?.toUpperCase() || 'FILE';
};

const NotesPage = () => {
  const {
    notes, pinnedNotes, unpinnedNotes, searchQuery, viewMode,
    isLoading, isUploading, loadNotes, upload, remove, togglePin,
    search, changeViewMode
  } = useNotes();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [openTree, setOpenTree] = useState({ 'Web Development': true });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCourse, setUploadCourse] = useState('');
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [uploadSemester, setUploadSemester] = useState('');
  const fileInputRef = useRef(null);

  // ✅ State for File Preview Modal
  const [previewNote, setPreviewNote] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { loadNotes(); }, []);

  const closeModal = () => {
    setUploadOpen(false);
    setUploadFile(null);
    setUploadTitle('');
    setUploadCourse('');
    setIsCustomCourse(false);
    setUploadSemester('');
  };

  const handleUpload = async () => {
    if (!uploadFile) { toast.error('File select karo!'); return; }
    if (!uploadTitle.trim()) { toast.error('Title daalo!'); return; }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle.trim());
    formData.append('course', uploadCourse.trim());
    formData.append('semester', uploadSemester);

    const result = await upload(formData);
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Note uploaded! ✅');
      closeModal();
    } else {
      toast.error('Upload failed ❌');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    const result = await remove(id);
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Note deleted');
      if (previewNote?._id === id) {
        setShowPreview(false);
        setPreviewNote(null);
      }
    } else {
      toast.error('Delete failed');
    }
  };

  const handleTogglePin = async (id) => {
    await togglePin(id);
  };

  // ✅ Preview handler — opens FilePreview modal
  const handlePreview = useCallback((note) => {
    setPreviewNote(note);
    setShowPreview(true);
  }, []);

  // ✅ Download handler — uses auth token for download
  const handleDownload = useCallback(async (note) => {
    try {
      await notesService.triggerDownload(note._id, note.fileName);
      toast.success('Download started!');
    } catch {
      // Fallback to direct Cloudinary URL
      if (note.fileUrl) {
        window.open(note.fileUrl, '_blank');
      } else {
        toast.error('Download failed');
      }
    }
  }, []);

  const kpis = [
    { icon: FileText, label: 'Total Notes', value: notes.length, color: '#4F46E5' },
    {
      icon: HardDrive, label: 'Storage Used',
      value: `${(notes.reduce((a, n) => a + (n.fileSize || 0), 0) / (1024 * 1024)).toFixed(1)} MB`,
      color: '#3B82F6'
    },
    {
      icon: Calendar, label: 'This Week',
      value: notes.filter(n => new Date(n.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      color: '#10B981'
    },
    { icon: Star, label: 'Pinned', value: notes.filter(n => n.isPinned).length, color: '#F59E0B' },
  ];

  const displayPinned = selectedSubject ? pinnedNotes.filter(n => n.subject === selectedSubject) : pinnedNotes;
  const displayUnpinned = selectedSubject ? unpinnedNotes.filter(n => n.subject === selectedSubject) : unpinnedNotes;

  if (isLoading) return (
    <div className="min-h-screen pt-[75px] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-[75px] bg-bg-page">
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">

        {/* Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="card p-4 sticky top-24">
            <h3 className="font-heading font-bold text-text-primary text-sm mb-3">📁 Browse by Subject</h3>
            <button onClick={() => setSelectedSubject(null)}
              className={`w-full text-left px-3 py-2 rounded-btn text-sm mb-1 transition-colors ${!selectedSubject ? 'bg-bg-secondary text-primary font-medium' : 'text-text-secondary hover:bg-bg-secondary'}`}>
              All Subjects
            </button>
            {sidebarTree.map(({ label, children }) => (
              <div key={label}>
                <button onClick={() => setOpenTree(p => ({ ...p, [label]: !p[label] }))}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-text-primary hover:bg-bg-secondary rounded-btn">
                  <span><Folder size={14} className="inline mr-2 text-primary" />{label}</span>
                  {openTree[label] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
                {openTree[label] && children.map(child => (
                  <button key={child} onClick={() => setSelectedSubject(child)}
                    className={`w-full text-left pl-10 pr-3 py-1.5 text-sm rounded-btn transition-colors ${selectedSubject === child ? 'text-primary bg-bg-secondary font-medium' : 'text-text-secondary hover:text-primary'}`}>
                    {child}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map(({ icon: Icon, label, value, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card p-5 hover:shadow-hover">
                <Icon size={22} style={{ color }} className="mb-2" />
                <p className="text-2xl font-heading font-extrabold text-text-primary">{value}</p>
                <p className="text-text-muted text-xs">{label}</p>
              </motion.div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Search notes..." value={searchQuery}
                onChange={(e) => search(e.target.value)} className="input-field pl-9 text-sm py-2.5" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => changeViewMode('grid')}
                className={`p-2 rounded-btn transition-colors ${viewMode === 'grid' ? 'bg-bg-secondary text-primary' : 'text-text-muted hover:text-primary'}`}>
                <Grid size={17} />
              </button>
              <button onClick={() => changeViewMode('list')}
                className={`p-2 rounded-btn transition-colors ${viewMode === 'list' ? 'bg-bg-secondary text-primary' : 'text-text-muted hover:text-primary'}`}>
                <List size={17} />
              </button>
              <button onClick={() => setUploadOpen(true)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5">
                <Upload size={15} /> Upload Note
              </button>
            </div>
          </div>

          {/* Empty State */}
          {notes.length === 0 && (
            <div className="text-center py-20">
              <FileText size={48} className="text-text-muted mx-auto mb-4" />
              <h3 className="font-heading font-bold text-text-primary text-lg mb-2">No notes available yet</h3>
              <p className="text-text-secondary text-sm mb-4">Upload your first note!</p>
              <button onClick={() => setUploadOpen(true)} className="btn-primary px-6 py-2.5 text-sm">
                <Upload size={15} className="inline mr-2" /> Upload Note
              </button>
            </div>
          )}

          {/* Pinned */}
          {displayPinned.length > 0 && (
            <div className="mb-8">
              <h3 className="font-heading font-bold text-text-primary text-sm mb-3 flex items-center gap-2">
                <Pin size={14} className="text-primary" /> Pinned Notes
              </h3>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
                {displayPinned.map(note => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    viewMode={viewMode}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Notes */}
          {displayUnpinned.length > 0 && (
            <>
              <h3 className="font-heading font-bold text-text-primary text-sm mb-3">
                All Notes ({displayUnpinned.length})
              </h3>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
                {displayUnpinned.map(note => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    viewMode={viewMode}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== Upload Modal ===== */}
      <AnimatePresence>
        {uploadOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="relative bg-white rounded-card shadow-hover p-8 w-full max-w-md z-10">
              <button onClick={closeModal} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
              <h2 className="font-heading font-bold text-text-primary text-xl mb-4">Upload Note 📄</h2>

              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-card p-8 text-center mb-4 hover:border-primary transition-colors cursor-pointer">
                <Upload size={32} className="text-text-muted mx-auto mb-2" />
                {uploadFile ? (
                  <p className="text-text-primary text-sm font-medium">✅ {uploadFile.name}</p>
                ) : (
                  <>
                    <p className="text-text-secondary text-sm">Click to select a file</p>
                    <p className="text-text-muted text-xs mt-1">PDF, Image, DOC, Video, Audio · Max 50MB</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp4,.webm,.mp3,.wav,.txt,.csv"
                className="hidden" onChange={(e) => setUploadFile(e.target.files[0])} />

              <input type="text" placeholder="Note title *" value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)} className="input-field mb-3 text-sm" />

              {!isCustomCourse ? (
                <select
                  value={uploadCourse}
                  onChange={(e) => {
                    if (e.target.value === '__other__') {
                      setIsCustomCourse(true);
                      setUploadCourse('');
                    } else {
                      setUploadCourse(e.target.value);
                    }
                  }}
                  className="input-field mb-3 text-sm"
                >
                  <option value="">Select Course</option>
                  {PRESET_COURSES.map(c => <option key={c}>{c}</option>)}
                  <option value="__other__">✏️ Other — Write Custom</option>
                </select>
              ) : (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Course name likho..."
                    value={uploadCourse}
                    onChange={(e) => setUploadCourse(e.target.value)}
                    className="input-field flex-1 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => { setIsCustomCourse(false); setUploadCourse(''); }}
                    title="Wapas select karo"
                    className="p-2 text-text-muted hover:text-error rounded-btn hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <select value={uploadSemester} onChange={(e) => setUploadSemester(e.target.value)}
                className="input-field mb-4 text-sm">
                <option value="">Select Semester</option>
                <option>Semester 1</option><option>Semester 2</option>
                <option>Semester 3</option><option>Semester 4</option>
                <option>Semester 5</option><option>Semester 6</option>
              </select>

              <button onClick={handleUpload} disabled={isUploading}
                className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2">
                {isUploading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={15} /> Upload Note</>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== File Preview Modal ===== */}
      <FilePreview
        note={previewNote}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewNote(null);
        }}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  NoteCard Component — with Preview + Download buttons
// ═══════════════════════════════════════════════════════════════════════════════
const NoteCard = ({ note, viewMode, onDelete, onTogglePin, onPreview, onDownload }) => {
  const { Icon: FileIcon, color: iconColor } = getFileIcon(note);
  const typeLabel = getFileTypeLabel(note);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card overflow-hidden group ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'p-5'} hover:shadow-lg transition-all`}
    >
      {/* Grid view header */}
      {viewMode === 'grid' && (
        <div
          className="h-24 rounded-btn mb-3 flex items-center justify-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${iconColor}10, ${iconColor}20)` }}
        >
          <FileIcon size={32} style={{ color: iconColor }} />
          {/* File type badge */}
          <span
            className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${iconColor}20`, color: iconColor }}
          >
            {typeLabel}
          </span>
        </div>
      )}

      {/* List view icon */}
      {viewMode === 'list' && (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${iconColor}15` }}
        >
          <FileIcon size={20} style={{ color: iconColor }} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-heading font-semibold text-text-primary text-sm truncate">{note.title}</h4>
        <p className="text-text-muted text-xs mt-0.5">
          {note.semester && <>{note.semester} · </>}{note.course}
        </p>
        {note.labels?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {note.labels.map(lb => (
              <span key={lb} className="badge text-[10px]"
                style={{ background: `${labelConfig[lb]?.color}15`, color: labelConfig[lb]?.color }}>
                {labelConfig[lb]?.icon} {labelConfig[lb]?.label}
              </span>
            ))}
          </div>
        )}
        <p className="text-text-muted text-[11px] mt-2 flex items-center gap-1">
          <Clock size={11} /> {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
          {note.fileSize && (
            <span className="ml-2">{(note.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
          )}
        </p>
      </div>

      {/* Actions — Preview + Download + Pin + Delete */}
      <div
        className={`flex items-center gap-1 ${viewMode === 'grid' ? 'mt-3 pt-3 border-t border-border justify-between' : 'flex-shrink-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-1">
          {/* ✅ Preview Button */}
          {note.fileUrl && (
            <button
              onClick={() => onPreview(note)}
              className="p-2 text-text-muted hover:text-primary rounded-btn hover:bg-primary/10 transition-colors"
              title="Preview"
            >
              <Eye size={14} />
            </button>
          )}

          {/* ✅ Download Button */}
          {note.fileUrl && (
            <button
              onClick={() => onDownload(note)}
              className="p-2 text-text-muted hover:text-emerald-600 rounded-btn hover:bg-emerald-50 transition-colors"
              title="Download"
            >
              <Download size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-1">
          {/* Pin */}
          <button onClick={() => onTogglePin(note._id)}
            className={`p-2 rounded-btn hover:bg-bg-secondary transition-colors ${note.isPinned ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
            title={note.isPinned ? 'Unpin' : 'Pin'}>
            <Pin size={14} />
          </button>

          {/* Delete */}
          <button onClick={() => onDelete(note._id)}
            className="p-2 text-text-muted hover:text-error rounded-btn hover:bg-red-50 transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotesPage;