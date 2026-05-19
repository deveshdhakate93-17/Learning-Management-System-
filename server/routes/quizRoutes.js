import { Router } from 'express';
import { getQuizzes, getQuizById, submitQuiz, getUserResults } from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/', protect, getQuizzes);
router.get('/user/results', protect, getUserResults);
router.get('/id/:id', protect, getQuizById);
router.post('/:id/submit', protect, submitQuiz);

export default router;
