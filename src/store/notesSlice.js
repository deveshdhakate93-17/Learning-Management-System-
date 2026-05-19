import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notesService from '../services/notesService';

export const fetchNotes = createAsyncThunk('notes/fetchAll', async (filters, { rejectWithValue }) => {
  try { return await notesService.getNotes(filters); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch notes'); }
});

export const uploadNote = createAsyncThunk('notes/upload', async (formData, { rejectWithValue }) => {
  try { return await notesService.uploadNote(formData); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Upload failed'); }
});

export const deleteNote = createAsyncThunk('notes/delete', async (id, { rejectWithValue }) => {
  try { await notesService.deleteNote(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Delete failed'); }
});

export const togglePinNote = createAsyncThunk('notes/pin', async (id, { rejectWithValue }) => {
  try { return await notesService.togglePin(id); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Pin failed'); }
});

export const updateNoteMetadata = createAsyncThunk('notes/update', async ({ id, data }, { rejectWithValue }) => {
  try { return await notesService.updateNote(id, data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Update failed'); }
});

// ✅ Helper — always returns a NEW array (never same reference)
const applySearch = (notes, query) => {
  if (!query) return [...notes];
  const q = query.toLowerCase();
  return notes.filter(n =>
    n.title?.toLowerCase().includes(q) ||
    n.subject?.toLowerCase().includes(q) ||
    n.course?.toLowerCase().includes(q)
  );
};

const notesSlice = createSlice({
  name: 'notes',
  initialState: {
    notes: [],
    filteredNotes: [],
    searchQuery: '',
    activeFilters: { course: '', subject: '', label: '' },
    viewMode: 'grid',
    isLoading: false,
    isUploading: false,
    error: null,
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.filteredNotes = applySearch(state.notes, action.payload); // ✅ new array
    },
    setFilter: (state, action) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.activeFilters = { course: '', subject: '', label: '' };
      state.filteredNotes = [...state.notes]; // ✅ new array
    },
  },
  extraReducers: (builder) => {

    // ── fetchNotes ────────────────────────────────────────────────────────────
    builder.addCase(fetchNotes.pending, (s) => {
      s.isLoading = true;
      s.error = null;
    });
    builder.addCase(fetchNotes.fulfilled, (s, a) => {
      s.isLoading = false;
      // Backend returns plain array: res.json(notes)
      const list = Array.isArray(a.payload) ? a.payload : [];
      s.notes = list;
      s.filteredNotes = applySearch(list, s.searchQuery); // ✅ new array
    });
    builder.addCase(fetchNotes.rejected, (s, a) => {
      s.isLoading = false;
      s.error = a.payload;
    });

    // ── uploadNote ────────────────────────────────────────────────────────────
    builder.addCase(uploadNote.pending, (s) => {
      s.isUploading = true;
      s.error = null;
    });
    builder.addCase(uploadNote.fulfilled, (s, a) => {
      s.isUploading = false;
      // ✅ Spread into new arrays — fixes same-reference re-render bug
      s.notes = [a.payload, ...s.notes];
      s.filteredNotes = applySearch(s.notes, s.searchQuery);
    });
    builder.addCase(uploadNote.rejected, (s, a) => {
      s.isUploading = false;
      s.error = a.payload;
    });

    // ── deleteNote ────────────────────────────────────────────────────────────
    builder.addCase(deleteNote.fulfilled, (s, a) => {
      s.notes = s.notes.filter(n => n._id !== a.payload);
      s.filteredNotes = s.filteredNotes.filter(n => n._id !== a.payload);
    });
    builder.addCase(deleteNote.rejected, (s, a) => {
      s.error = a.payload;
    });

    // ── togglePin ─────────────────────────────────────────────────────────────
    builder.addCase(togglePinNote.fulfilled, (s, a) => {
      const update = (arr) => arr.map(n => n._id === a.payload._id ? a.payload : n);
      s.notes = update(s.notes);
      s.filteredNotes = update(s.filteredNotes);
    });

    // ── updateNote ────────────────────────────────────────────────────────────
    builder.addCase(updateNoteMetadata.fulfilled, (s, a) => {
      s.notes = s.notes.map(n => n._id === a.payload._id ? a.payload : n);
      s.filteredNotes = s.filteredNotes.map(n => n._id === a.payload._id ? a.payload : n);
    });
  },
});

export const { setSearchQuery, setFilter, setViewMode, clearFilters } = notesSlice.actions;
export default notesSlice.reducer;