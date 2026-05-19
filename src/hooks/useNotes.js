import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchNotes,
  uploadNote,
  deleteNote,
  togglePinNote,
  updateNoteMetadata,
  setSearchQuery,
  setFilter,
  setViewMode,
  clearFilters,
} from '../store/notesSlice';

const useNotes = () => {
  const dispatch = useDispatch();
  const { notes, filteredNotes, searchQuery, activeFilters, viewMode, isLoading, isUploading, error } = useSelector((s) => s.notes);

  const loadNotes = useCallback(
    (filters) => dispatch(fetchNotes(filters)),
    [dispatch]
  );

  const upload = useCallback(
    (formData) => dispatch(uploadNote(formData)),
    [dispatch]
  );

  const remove = useCallback(
    (id) => dispatch(deleteNote(id)),
    [dispatch]
  );

  const togglePin = useCallback(
    (id) => dispatch(togglePinNote(id)),
    [dispatch]
  );

  const updateNote = useCallback(
    (id, data) => dispatch(updateNoteMetadata({ id, data })),
    [dispatch]
  );

  const search = useCallback(
    (query) => dispatch(setSearchQuery(query)),
    [dispatch]
  );

  const setFilterValue = useCallback(
    (filter) => dispatch(setFilter(filter)),
    [dispatch]
  );

  const changeViewMode = useCallback(
    (mode) => dispatch(setViewMode(mode)),
    [dispatch]
  );

  const resetFilters = useCallback(
    () => dispatch(clearFilters()),
    [dispatch]
  );

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  return {
    notes,
    filteredNotes,
    pinnedNotes,
    unpinnedNotes,
    searchQuery,
    activeFilters,
    viewMode,
    isLoading,
    isUploading,
    error,
    loadNotes,
    upload,
    remove,
    togglePin,
    updateNote,
    search,
    setFilterValue,
    changeViewMode,
    resetFilters,
  };
};

export default useNotes;
