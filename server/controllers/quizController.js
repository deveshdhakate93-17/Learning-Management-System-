import Quiz from '../models/Quiz.js';
import QuizResult from '../models/QuizResult.js';

export const getQuizzes = async (req, res) => {
  try {
    const filter = { isPublished: true };
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    const quizzes = await Quiz.find(filter).select('-questions.correctAnswer -questions.explanation');
    res.json(quizzes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-questions.correctAnswer -questions.explanation');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    const { answers } = req.body;
    let correct = 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    let earnedPoints = 0;
    const detailed = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctAnswer;
      if (isCorrect) { correct++; earnedPoints += (q.points || 1); }
      return { questionIndex: i, selectedAnswer: answers[i], isCorrect };
    });
    const percentage = Math.round((correct / quiz.questions.length) * 100);
    const result = await QuizResult.create({
      user: req.user._id, quiz: quiz._id, answers: detailed,
      score: correct, percentage, passed: percentage >= quiz.passingScore,
      timeTaken: req.body.timeTaken,
    });
    res.json({ correct, total: quiz.questions.length, percentage, passed: result.passed, timeTaken: result.timeTaken, answers: detailed.map((a, i) => ({ ...a, correctAnswer: quiz.questions[i].correctAnswer, explanation: quiz.questions[i].explanation })) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getUserResults = async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id }).populate('quiz', 'title topic subject').sort('-createdAt');
    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
