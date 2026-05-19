import { api } from './authService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const notesService = {
  getNotes: async (filters) => {
    const { data } = await api.get('/notes', { params: filters });
    return data;
  },
  uploadNote: async (formData) => {
    const { data } = await api.post('/notes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  getNoteById: async (id) => {
    const { data } = await api.get(`/notes/${id}/detail`);
    return data;
  },
  updateNote: async (id, noteData) => {
    const { data } = await api.patch(`/notes/${id}`, noteData);
    return data;
  },
  deleteNote: async (id) => {
    const { data } = await api.delete(`/notes/${id}`);
    return data;
  },
  togglePin: async (id) => {
    const { data } = await api.post(`/notes/${id}/pin`);
    return data;
  },
  searchNotes: async (query) => {
    const { data } = await api.get('/notes/search', { params: { q: query } });
    return data;
  },
  getInsights: async () => {
    const { data } = await api.get('/notes/insights');
    return data;
  },
  generateSummary: async (id) => {
    const { data } = await api.post(`/notes/${id}/summary`);
    return data;
  },

  // ─── File serving helpers ────────────────────────────────────────────────
  /** Returns the authenticated preview URL (proxied via backend) */
  getPreviewUrl: (noteId) => `${API_BASE}/notes/preview/${noteId}`,

  /** Returns the authenticated download URL (proxied via backend) */
  getDownloadUrl: (noteId) => `${API_BASE}/notes/download/${noteId}`,

  /** Fetch file as blob with auth (for inline preview of protected resources) */
  fetchFileBlob: async (noteId) => {
    const response = await api.get(`/notes/preview/${noteId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /** Trigger authenticated download */
  triggerDownload: async (noteId, fileName = 'file') => {
    try {
      const response = await api.get(`/notes/download/${noteId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      throw err;
    }
  },

  /** Fetch text content for .txt file preview */
  fetchTextContent: async (noteId) => {
    const response = await api.get(`/notes/preview/${noteId}`, {
      responseType: 'text',
    });
    return response.data;
  },
};

export default notesService;
