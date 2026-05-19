import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import progressService from '../services/progressService';

export const fetchProgress = createAsyncThunk('progress/fetch', async (courseId, { rejectWithValue }) => {
  try { return await progressService.getCourseProgress(courseId); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch progress'); }
});

export const markLectureCompleted = createAsyncThunk('progress/markComplete', async ({ courseId, lectureId }, { rejectWithValue }) => {
  try { return await progressService.markLectureCompleted(courseId, lectureId); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to mark lecture'); }
});

export const saveResumePosition = createAsyncThunk('progress/saveResume', async ({ courseId, lectureId, timestamp }, { rejectWithValue }) => {
  try { return await progressService.saveResumePosition(courseId, lectureId, timestamp); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to save position'); }
});

const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    progressMap: {},   // { courseId: { percentage, completedLectures, lastWatched } }
    isLoading: false,
    error: null,
  },
  reducers: {
    updateLocalProgress: (state, action) => {
      const { courseId, lectureId } = action.payload;
      if (!state.progressMap[courseId]) state.progressMap[courseId] = { completedLectures: [] };
      if (!state.progressMap[courseId].completedLectures.includes(lectureId)) {
        state.progressMap[courseId].completedLectures.push(lectureId);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProgress.pending, (s) => { s.isLoading = true; });
    builder.addCase(fetchProgress.fulfilled, (s, a) => {
      s.isLoading = false;
      s.progressMap[a.payload.courseId] = a.payload;
    });
    builder.addCase(fetchProgress.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
    builder.addCase(markLectureCompleted.fulfilled, (s, a) => {
      if (a.payload) s.progressMap[a.payload.courseId] = a.payload;
    });
  },
});

export const { updateLocalProgress } = progressSlice.actions;
export default progressSlice.reducer;
