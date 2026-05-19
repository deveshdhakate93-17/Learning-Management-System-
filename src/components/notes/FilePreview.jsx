import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Maximize2, Minimize2, FileText, Image, Film,
  Music, FileSpreadsheet, Presentation, File, Loader2, AlertCircle,
  ExternalLink,
} from 'lucide-react';
import notesService from '../../services/notesService';

// ─── File type utilities ─────────────────────────────────────────────────────
const getFileCategory = (note) => {
  const { fileType, fileName = '', mimeType = '' } = note;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // Use fileType from DB first
  if (fileType === 'pdf' || ext === 'pdf') return 'pdf';
  if (fileType === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (fileType === 'video' || ['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
  if (fileType === 'audio' || ['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return 'audio';
  if (fileType === 'text' || ['txt', 'csv', 'log', 'md'].includes(ext)) return 'text';
  if (fileType === 'doc' || ['doc', 'docx'].includes(ext)) return 'office-doc';
  if (fileType === 'ppt' || ['ppt', 'pptx'].includes(ext)) return 'office-ppt';
  if (fileType === 'xls' || ['xls', 'xlsx'].includes(ext)) return 'office-xls';

  // Fallback to mimeType
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'text/plain') return 'text';

  return 'other';
};

const getCategoryIcon = (category) => {
  const iconMap = {
    pdf: FileText,
    image: Image,
    video: Film,
    audio: Music,
    text: FileText,
    'office-doc': FileText,
    'office-ppt': Presentation,
    'office-xls': FileSpreadsheet,
    other: File,
  };
  return iconMap[category] || File;
};

const getCategoryLabel = (category) => {
  const labels = {
    pdf: 'PDF Document',
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    text: 'Text File',
    'office-doc': 'Word Document',
    'office-ppt': 'Presentation',
    'office-xls': 'Spreadsheet',
    other: 'File',
  };
  return labels[category] || 'File';
};

const getCategoryColor = (category) => {
  const colors = {
    pdf: '#EF4444',
    image: '#10B981',
    video: '#8B5CF6',
    audio: '#F59E0B',
    text: '#6B7280',
    'office-doc': '#2563EB',
    'office-ppt': '#F97316',
    'office-xls': '#059669',
    other: '#9CA3AF',
  };
  return colors[category] || '#9CA3AF';
};

// ─── Main Component ──────────────────────────────────────────────────────────
const FilePreview = ({ note, isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileError, setFileError] = useState(null);
  const containerRef = useRef(null);

  const category = note ? getFileCategory(note) : 'other';
  const CategoryIcon = getCategoryIcon(category);
  const token = localStorage.getItem('lms_token');

  // Clean up blob URLs on unmount or note change
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  // Load file when modal opens
  useEffect(() => {
    if (!isOpen || !note?._id) return;

    setFileError(null);
    setBlobUrl(null);
    setTextContent('');

    const loadFile = async () => {
      // For office docs, we use Google Docs Viewer — no blob needed
      if (['office-doc', 'office-ppt', 'office-xls'].includes(category)) {
        return;
      }

      // For text files, fetch as text
      if (category === 'text') {
        setIsLoadingFile(true);
        try {
          const text = await notesService.fetchTextContent(note._id);
          setTextContent(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
        } catch (err) {
          setFileError('Failed to load text content');
        } finally {
          setIsLoadingFile(false);
        }
        return;
      }

      // For pdf, image, video, audio — fetch as blob
      if (['pdf', 'image', 'video', 'audio'].includes(category)) {
        setIsLoadingFile(true);
        try {
          const blob = await notesService.fetchFileBlob(note._id);
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
        } catch (err) {
          setFileError('Failed to load file preview');
        } finally {
          setIsLoadingFile(false);
        }
        return;
      }
    };

    loadFile();
  }, [isOpen, note?._id, category]);

  const handleDownload = useCallback(async () => {
    if (!note) return;
    try {
      await notesService.triggerDownload(note._id, note.fileName);
    } catch {
      // fallback: open direct cloudinary URL
      if (note.fileUrl) {
        window.open(note.fileUrl, '_blank');
      }
    }
  }, [note]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      }
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isFullscreen, onClose]);

  if (!isOpen || !note) return null;

  // Google Docs Viewer URL for Office files
  const getGoogleViewerUrl = () => {
    // We need a publicly accessible URL for Google Docs Viewer
    // If the file is on Cloudinary, use the original fileUrl
    const fileUrl = note.fileUrl;
    if (!fileUrl) return null;
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  };

  // ─── Render file content ────────────────────────────────────────────────
  const renderPreviewContent = () => {
    if (isLoadingFile) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-text-secondary text-sm">Loading preview...</p>
        </div>
      );
    }

    if (fileError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
          <AlertCircle size={48} className="text-error" />
          <p className="text-text-secondary text-sm">{fileError}</p>
          <button
            onClick={handleDownload}
            className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
          >
            <Download size={16} /> Download Instead
          </button>
        </div>
      );
    }

    switch (category) {
      case 'pdf':
        return blobUrl ? (
          <iframe
            src={`${blobUrl}#toolbar=1&navpanes=0`}
            title={note.title}
            className="w-full h-full rounded-lg border border-border"
            style={{ minHeight: isFullscreen ? '85vh' : '65vh' }}
          />
        ) : null;

      case 'image':
        return blobUrl ? (
          <div className="flex items-center justify-center h-full p-4">
            <img
              src={blobUrl}
              alt={note.title}
              className="max-w-full max-h-full rounded-lg shadow-lg object-contain"
              style={{ maxHeight: isFullscreen ? '85vh' : '65vh' }}
            />
          </div>
        ) : null;

      case 'video':
        return blobUrl ? (
          <div className="flex items-center justify-center h-full p-4">
            <video
              src={blobUrl}
              controls
              autoPlay={false}
              className="max-w-full rounded-lg shadow-lg"
              style={{ maxHeight: isFullscreen ? '85vh' : '65vh' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : null;

      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-6 p-8">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${getCategoryColor('audio')}20, ${getCategoryColor('audio')}40)`,
              }}
            >
              <Music size={48} style={{ color: getCategoryColor('audio') }} />
            </div>
            <h3 className="font-heading font-semibold text-text-primary text-lg text-center">
              {note.fileName || note.title}
            </h3>
            {blobUrl && (
              <audio controls autoPlay={false} className="w-full max-w-md">
                <source src={blobUrl} />
                Your browser does not support the audio element.
              </audio>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="p-6 h-full overflow-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm text-text-primary bg-bg-secondary p-6 rounded-lg border border-border leading-relaxed overflow-auto"
              style={{ maxHeight: isFullscreen ? '80vh' : '60vh' }}
            >
              {textContent || 'No content'}
            </pre>
          </div>
        );

      case 'office-doc':
      case 'office-ppt':
      case 'office-xls': {
        const viewerUrl = getGoogleViewerUrl();
        return viewerUrl ? (
          <div className="h-full flex flex-col">
            <div className="px-4 py-2 bg-bg-secondary border-b border-border flex items-center justify-between">
              <span className="text-xs text-text-muted flex items-center gap-1.5">
                <ExternalLink size={12} />
                Powered by Google Docs Viewer
              </span>
              <a
                href={viewerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Open in new tab <ExternalLink size={10} />
              </a>
            </div>
            <iframe
              src={viewerUrl}
              title={note.title}
              className="w-full flex-1 border-0"
              style={{ minHeight: isFullscreen ? '80vh' : '60vh' }}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
            <CategoryIcon size={64} className="text-text-muted" />
            <p className="text-text-secondary text-sm">Cannot preview this file</p>
            <button
              onClick={handleDownload}
              className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
            >
              <Download size={16} /> Download File
            </button>
          </div>
        );
      }

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 p-8">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{ background: `${getCategoryColor(category)}15` }}
            >
              <CategoryIcon size={40} style={{ color: getCategoryColor(category) }} />
            </div>
            <h3 className="font-heading font-semibold text-text-primary text-lg">
              {note.fileName || 'Unknown File'}
            </h3>
            <p className="text-text-secondary text-sm text-center max-w-sm">
              This file type cannot be previewed in browser. Click below to download.
            </p>
            <button
              onClick={handleDownload}
              className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
            >
              <Download size={16} /> Download File
            </button>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ padding: isFullscreen ? 0 : '1rem' }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          ref={containerRef}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative bg-white shadow-2xl z-10 flex flex-col overflow-hidden ${
            isFullscreen
              ? 'w-screen h-screen rounded-none'
              : 'w-full max-w-5xl max-h-[92vh] rounded-2xl'
          }`}
        >
          {/* ─── Header ────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${getCategoryColor(category)}15` }}
              >
                <CategoryIcon size={20} style={{ color: getCategoryColor(category) }} />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading font-bold text-lg text-text-primary truncate">
                  {note.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                  <span
                    className="px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${getCategoryColor(category)}15`,
                      color: getCategoryColor(category),
                    }}
                  >
                    {getCategoryLabel(category)}
                  </span>
                  {note.fileName && (
                    <span className="truncate max-w-[200px]">{note.fileName}</span>
                  )}
                  {note.fileSize && (
                    <span>
                      {(note.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-lg hover:bg-bg-secondary transition-colors text-text-muted hover:text-text-primary"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                onClick={handleDownload}
                className="p-2.5 rounded-lg hover:bg-primary/10 transition-colors text-primary"
                title="Download"
              >
                <Download size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2.5 rounded-lg hover:bg-bg-secondary transition-colors text-text-muted hover:text-text-primary"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ─── Content ───────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-hidden bg-bg-page">
            {renderPreviewContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FilePreview;
