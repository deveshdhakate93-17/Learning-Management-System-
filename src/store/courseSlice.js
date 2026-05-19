import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import courseService from '../services/courseService';

export const fetchCourses = createAsyncThunk('courses/fetchAll', async (_, { rejectWithValue }) => {
  try { return await courseService.getEnrolledCourses(); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch courses'); }
});

export const fetchCourseBySlug = createAsyncThunk('courses/fetchBySlug', async (slug, { rejectWithValue }) => {
  try { return await courseService.getCourseBySlug(slug); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch course'); }
});

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    currentCourse: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentCourse: (state) => { state.currentCourse = null; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCourses.pending, (s) => { s.isLoading = true; s.error = null; });
    builder.addCase(fetchCourses.fulfilled, (s, a) => { s.isLoading = false; s.courses = a.payload; });
    builder.addCase(fetchCourses.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
    builder.addCase(fetchCourseBySlug.pending, (s) => { s.isLoading = true; s.error = null; });
    builder.addCase(fetchCourseBySlug.fulfilled, (s, a) => { s.isLoading = false; s.currentCourse = a.payload; });
    builder.addCase(fetchCourseBySlug.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
  },
});

export const { clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
