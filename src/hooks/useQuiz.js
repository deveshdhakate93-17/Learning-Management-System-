import { useState, useEffect, useCallback, useRef } from 'react';

const useQuiz = (quiz) => {
  const [status, setStatus] = useState('idle'); // idle | active | submitted | reviewing
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    if (status !== 'active' || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) {
          submitQuiz();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [status, timeLeft]);

  const startQuiz = useCallback((quizData) => {
    setStatus('active');
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
    setTimeLeft((quizData || quiz).timeLimit * 60);
  }, [quiz]);

  const selectAnswer = useCallback((questionIdx, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  }, []);

  const nextQuestion = useCallback(() => {
    if (!quiz) return;
    setCurrentQ((p) => Math.min(quiz.questions.length - 1, p + 1));
  }, [quiz]);

  const prevQuestion = useCallback(() => {
    setCurrentQ((p) => Math.max(0, p - 1));
  }, []);

  const goToQuestion = useCallback((idx) => {
    setCurrentQ(idx);
  }, []);

  const submitQuiz = useCallback(() => {
    if (!quiz) return;
    clearInterval(timerRef.current);
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    const total = quiz.questions.length;
    const percentage = Math.round((correct / total) * 100);
    const timeTaken = (quiz.timeLimit * 60) - timeLeft;
    setResult({
      correct,
      total,
      percentage,
      passed: percentage >= quiz.passingScore,
      timeTaken,
    });
    setStatus('submitted');
  }, [quiz, answers, timeLeft]);

  const reviewAnswers = useCallback(() => {
    setStatus('reviewing');
    setCurrentQ(0);
  }, []);

  const retakeQuiz = useCallback(() => {
    if (quiz) startQuiz(quiz);
  }, [quiz, startQuiz]);

  const resetQuiz = useCallback(() => {
    clearInterval(timerRef.current);
    setStatus('idle');
    setCurrentQ(0);
    setAnswers({});
    setTimeLeft(0);
    setResult(null);
  }, []);

  const formatTimer = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const answeredCount = Object.keys(answers).length;
  const progressPct = quiz ? Math.round((answeredCount / quiz.questions.length) * 100) : 0;

  return {
    status,
    currentQ,
    answers,
    timeLeft,
    result,
    answeredCount,
    progressPct,
    startQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitQuiz,
    reviewAnswers,
    retakeQuiz,
    resetQuiz,
    formatTimer,
  };
};

export default useQuiz;
