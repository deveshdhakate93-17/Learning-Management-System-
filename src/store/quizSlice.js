import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quizService from '../services/quizService';

export const fetchQuizzes = createAsyncThunk('quiz/fetchAll', async (filters, { rejectWithValue }) => {
  try { return await quizService.getQuizzes(filters); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch quizzes'); }
});

export const fetchQuizById = createAsyncThunk('quiz/fetchById', async (id, { rejectWithValue }) => {
  try { return await quizService.getQuizById(id); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch quiz'); }
});

export const submitQuiz = createAsyncThunk('quiz/submit', async ({ id, answers }, { rejectWithValue }) => {
  try { return await quizService.submitQuiz(id, answers); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to submit quiz'); }
});

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    quizzes: [],
    activeQuiz: null,
    currentQuestionIndex: 0,
    userAnswers: {},        // { questionIndex: selectedAnswer }
    timeRemaining: 0,
    quizStatus: 'idle',     // idle | active | submitted | reviewing
    result: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    startQuiz: (state, action) => {
      state.activeQuiz = action.payload;
      state.currentQuestionIndex = 0;
      state.userAnswers = {};
      state.quizStatus = 'active';
      state.result = null;
      state.timeRemaining = (action.payload.timeLimit || 15) * 60;
    },
    setAnswer: (state, action) => {
      const { questionIndex, answer } = action.payload;
      state.userAnswers[questionIndex] = answer;
    },
    nextQuestion: (state) => {
      if (state.activeQuiz && state.currentQuestionIndex < state.activeQuiz.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    prevQuestion: (state) => {
      if (state.currentQuestionIndex > 0) state.currentQuestionIndex -= 1;
    },
    goToQuestion: (state, action) => { state.currentQuestionIndex = action.payload; },
    tickTimer: (state) => {
      if (state.timeRemaining > 0) state.timeRemaining -= 1;
    },
    resetQuiz: (state) => {
      state.activeQuiz = null;
      state.currentQuestionIndex = 0;
      state.userAnswers = {};
      state.quizStatus = 'idle';
      state.result = null;
      state.timeRemaining = 0;
    },
    setReviewing: (state) => { state.quizStatus = 'reviewing'; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchQuizzes.pending, (s) => { s.isLoading = true; s.error = null; });
    builder.addCase(fetchQuizzes.fulfilled, (s, a) => { s.isLoading = false; s.quizzes = a.payload; });
    builder.addCase(fetchQuizzes.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
    builder.addCase(fetchQuizById.fulfilled, (s, a) => { s.activeQuiz = a.payload; });
    builder.addCase(submitQuiz.pending, (s) => { s.isLoading = true; });
    builder.addCase(submitQuiz.fulfilled, (s, a) => {
      s.isLoading = false;
      s.result = a.payload;
      s.quizStatus = 'submitted';
    });
    builder.addCase(submitQuiz.rejected, (s, a) => { s.isLoading = false; s.error = a.payload; });
  },
});

export const { startQuiz, setAnswer, nextQuestion, prevQuestion, goToQuestion, tickTimer, resetQuiz, setReviewing } = quizSlice.actions;
export default quizSlice.reducer;
