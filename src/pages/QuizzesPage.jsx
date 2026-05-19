import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Search, Clock, Target, BarChart3,
  CheckCircle2, XCircle, Trophy, RotateCcw, ArrowLeft, ArrowRight
} from 'lucide-react';

// Quiz data — representative subset (full 190 in seed.js)
const quizBank = [
  { id: 'html', title: 'HTML Quiz', subject: 'web-development', topic: 'HTML', difficulty: 'beginner', timeLimit: 15, passingScore: 70, questions: [
    { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], correctAnswer: 0 },
    { question: 'Which tag is used for the largest heading?', options: ['<head>', '<h6>', '<h1>', '<heading>'], correctAnswer: 2 },
    { question: 'Which element is used to create a hyperlink?', options: ['<link>', '<a>', '<href>', '<nav>'], correctAnswer: 1 },
    { question: 'What is the correct HTML for adding a background color?', options: ['<body bg="yellow">', '<body style="background-color:yellow;">', '<background>yellow</background>', '<body color="yellow">'], correctAnswer: 1 },
    { question: 'Which HTML attribute specifies an alternate text for an image?', options: ['title', 'src', 'alt', 'name'], correctAnswer: 2 },
    { question: 'Which tag creates a line break?', options: ['<break>', '<lb>', '<br>', '<newline>'], correctAnswer: 2 },
    { question: 'Which input type creates a checkbox?', options: ['<input type="check">', '<input type="checkbox">', '<checkbox>', '<input type="tick">'], correctAnswer: 1 },
    { question: 'What is semantic HTML?', options: ['HTML with CSS', 'HTML that clearly describes its meaning', 'HTML5 only features', 'HTML with JavaScript'], correctAnswer: 1 },
    { question: 'Which tag is used to define an unordered list?', options: ['<ol>', '<li>', '<ul>', '<list>'], correctAnswer: 2 },
    { question: 'Which doctype is correct for HTML5?', options: ['<!DOCTYPE html5>', '<!DOCTYPE HTML PUBLIC>', '<!DOCTYPE html>', '<doctype html>'], correctAnswer: 2 },
  ]},
  { id: 'css', title: 'CSS Quiz', subject: 'web-development', topic: 'CSS', difficulty: 'beginner', timeLimit: 15, passingScore: 70, questions: [
    { question: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Creative Style System', 'Computer Style Sheets', 'Colorful Style Sheets'], correctAnswer: 0 },
    { question: 'Which property changes text color?', options: ['font-color', 'text-color', 'color', 'foreground-color'], correctAnswer: 2 },
    { question: 'Which CSS property controls the text size?', options: ['text-style', 'font-size', 'text-size', 'font-style'], correctAnswer: 1 },
    { question: 'How do you select an element with id "demo"?', options: ['.demo', '#demo', 'demo', '*demo'], correctAnswer: 1 },
    { question: 'Which property is used for background color?', options: ['bgcolor', 'color', 'background-color', 'bg-color'], correctAnswer: 2 },
    { question: 'How do you make text bold?', options: ['font-weight: bold', 'font-style: bold', 'text-style: bold', 'text-weight: bold'], correctAnswer: 0 },
    { question: 'Which display value makes element a flex container?', options: ['display: block', 'display: inline', 'display: flex', 'display: grid-flex'], correctAnswer: 2 },
    { question: 'Which property creates space inside an element?', options: ['margin', 'spacing', 'padding', 'border'], correctAnswer: 2 },
    { question: 'What is the default position value?', options: ['relative', 'absolute', 'fixed', 'static'], correctAnswer: 3 },
    { question: 'Which unit is relative to the root font size?', options: ['em', 'px', 'rem', '%'], correctAnswer: 2 },
  ]},
  { id: 'js', title: 'JavaScript Quiz', subject: 'web-development', topic: 'JavaScript', difficulty: 'intermediate', timeLimit: 20, passingScore: 70, questions: [
    { question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'const', 'Both let and const'], correctAnswer: 3 },
    { question: 'What does === check?', options: ['Value only', 'Type only', 'Value and type', 'Reference'], correctAnswer: 2 },
    { question: 'Which method adds to end of array?', options: ['push()', 'append()', 'add()', 'insert()'], correctAnswer: 0 },
    { question: 'What is a closure?', options: ['A CSS property', 'A function with access to outer scope', 'A loop type', 'An HTML element'], correctAnswer: 1 },
    { question: 'Which is NOT a JS data type?', options: ['undefined', 'boolean', 'float', 'symbol'], correctAnswer: 2 },
    { question: 'What does JSON.parse() do?', options: ['Converts object to string', 'Parses JSON string to object', 'Creates JSON file', 'Validates JSON'], correctAnswer: 1 },
    { question: 'Which event fires when DOM is ready?', options: ['onload', 'DOMContentLoaded', 'onready', 'DOMReady'], correctAnswer: 1 },
    { question: 'What does the spread operator look like?', options: ['**', '...', '&&', '||'], correctAnswer: 1 },
    { question: 'What is Promise used for?', options: ['Synchronous code', 'Asynchronous operations', 'DOM manipulation', 'CSS styling'], correctAnswer: 1 },
    { question: 'Which method creates a new array from existing?', options: ['forEach()', 'map()', 'push()', 'splice()'], correctAnswer: 1 },
  ]},
  { id: 'react', title: 'React Quiz', subject: 'web-development', topic: 'React', difficulty: 'intermediate', timeLimit: 20, passingScore: 70, questions: [
    { question: 'What is JSX?', options: ['A database', 'JavaScript XML syntax', 'A CSS framework', 'A testing library'], correctAnswer: 1 },
    { question: 'Which hook manages state?', options: ['useEffect', 'useState', 'useRef', 'useMemo'], correctAnswer: 1 },
    { question: 'What are props in React?', options: ['State variables', 'CSS properties', 'Arguments passed to components', 'Event handlers'], correctAnswer: 2 },
    { question: 'Which hook runs side effects?', options: ['useState', 'useCallback', 'useEffect', 'useReducer'], correctAnswer: 2 },
    { question: 'What is the virtual DOM?', options: ['The actual DOM', 'A lightweight copy of DOM', 'A CSS property', 'A database'], correctAnswer: 1 },
    { question: 'How do you pass data from parent to child?', options: ['state', 'context', 'props', 'refs'], correctAnswer: 2 },
    { question: 'Which method renders a React component?', options: ['ReactDOM.render()', 'React.display()', 'React.show()', 'DOM.append()'], correctAnswer: 0 },
    { question: 'What is a React fragment?', options: ['A broken component', 'Wrapper without extra DOM node', 'A CSS property', 'A routing method'], correctAnswer: 1 },
    { question: 'Which hook avoids unnecessary re-renders?', options: ['useState', 'useEffect', 'useMemo', 'useRef'], correctAnswer: 2 },
    { question: 'What does useRef return?', options: ['A state value', 'A mutable ref object', 'A callback', 'A boolean'], correctAnswer: 1 },
  ]},
  { id: 'python-basics', title: 'Python Basics Quiz', subject: 'python', topic: 'Basics', difficulty: 'beginner', timeLimit: 15, passingScore: 70, questions: [
    { question: 'Which function prints output in Python?', options: ['echo()', 'console.log()', 'print()', 'write()'], correctAnswer: 2 },
    { question: 'How do you create a variable in Python?', options: ['var x = 5', 'int x = 5', 'x = 5', 'let x = 5'], correctAnswer: 2 },
    { question: 'Which data type is immutable?', options: ['list', 'dict', 'tuple', 'set'], correctAnswer: 2 },
    { question: 'What is the output of type(42)?', options: ['<class "int">', '<class "float">', '<class "str">', '<class "num">'], correctAnswer: 0 },
    { question: 'Which keyword defines a function?', options: ['function', 'func', 'def', 'lambda'], correctAnswer: 2 },
    { question: 'How do you start a comment?', options: ['//', '/*', '#', '--'], correctAnswer: 2 },
    { question: 'Which operator is used for exponentiation?', options: ['^', '**', 'pow', 'exp'], correctAnswer: 1 },
    { question: 'What does len() do?', options: ['Returns type', 'Returns length', 'Returns max value', 'Returns sum'], correctAnswer: 1 },
    { question: 'Which loop iterates over a sequence?', options: ['while', 'do-while', 'for', 'loop'], correctAnswer: 2 },
    { question: 'What is a list comprehension?', options: ['A list method', 'Concise way to create lists', 'A sorting algorithm', 'A data type'], correctAnswer: 1 },
  ]},
  { id: 'dsa-arrays', title: 'DSA: Arrays Quiz', subject: 'dsa', topic: 'Arrays', difficulty: 'intermediate', timeLimit: 20, passingScore: 70, questions: [
    { question: 'What is the time complexity of array access by index?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correctAnswer: 2 },
    { question: 'Which sorting algorithm has best average case?', options: ['Bubble Sort O(n²)', 'Quick Sort O(n log n)', 'Selection Sort O(n²)', 'Insertion Sort O(n²)'], correctAnswer: 1 },
    { question: 'What is a two-pointer technique?', options: ['Using two arrays', 'Two pointers traversing array', 'Double linked list', 'Binary search'], correctAnswer: 1 },
    { question: 'Time complexity of linear search?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctAnswer: 2 },
    { question: 'Which is NOT an in-place sorting algorithm?', options: ['Bubble Sort', 'Merge Sort', 'Quick Sort', 'Selection Sort'], correctAnswer: 1 },
    { question: 'What is the kadane algorithm used for?', options: ['Sorting', 'Maximum subarray sum', 'Binary search', 'Graph traversal'], correctAnswer: 1 },
    { question: 'Space complexity of an array of n elements?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctAnswer: 2 },
    { question: 'What does array.splice() do in JavaScript?', options: ['Searches array', 'Adds/removes elements', 'Sorts array', 'Copies array'], correctAnswer: 1 },
    { question: 'Best case time complexity of Binary Search?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'], correctAnswer: 1 },
    { question: 'What is a prefix sum array?', options: ['First element array', 'Cumulative sum array', 'Sorted array', 'Reversed array'], correctAnswer: 1 },
  ]},
];

// Sidebar nav tree
const navTree = [
  { label: 'Web Development', icon: '🌐', subjects: ['HTML', 'CSS', 'JavaScript', 'React'] },
  { label: 'Python', icon: '🐍', subjects: ['Basics'] },
  { label: 'DSA', icon: '🧮', subjects: ['Arrays'] },
];

const QuizzesPage = () => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizStatus, setQuizStatus] = useState('idle');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [openNav, setOpenNav] = useState({ 'Web Development': true });
  const [searchQuery, setSearchQuery] = useState('');

  // Timer
  useEffect(() => {
    if (quizStatus !== 'active' || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { handleSubmit(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [quizStatus, timeLeft]);

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz); setQuizStatus('active'); setCurrentQ(0);
    setAnswers({}); setResult(null); setTimeLeft(quiz.timeLimit * 60);
  };

  const handleSubmit = useCallback(() => {
    if (!activeQuiz) return;
    let correct = 0;
    activeQuiz.questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    const pct = Math.round((correct / activeQuiz.questions.length) * 100);
    setResult({ correct, total: activeQuiz.questions.length, percentage: pct, passed: pct >= activeQuiz.passingScore, timeTaken: (activeQuiz.timeLimit * 60) - timeLeft });
    setQuizStatus('submitted');
  }, [activeQuiz, answers, timeLeft]);

  const formatTimer = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const filteredQuizzes = selectedTopic ? quizBank.filter(q => q.topic === selectedTopic) : quizBank;
  const displayQuizzes = searchQuery ? quizBank.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase())) : filteredQuizzes;

  return (
    <div className="min-h-screen pt-[75px] bg-bg-page">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-text-muted text-sm mb-1">Home {'>'} Quizzes</p>
          <h1 className="font-heading font-extrabold text-text-primary text-3xl mb-1">Quizzes 📝</h1>
          <p className="text-text-secondary text-sm">Test your knowledge across all courses</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="card p-4 sticky top-24">
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Search quizzes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 text-sm py-2" />
            </div>
            <button onClick={() => { setSelectedTopic(null); setSearchQuery(''); }}
              className={`w-full text-left px-3 py-2 rounded-btn text-sm font-medium mb-2 transition-colors ${!selectedTopic ? 'bg-bg-secondary text-primary' : 'text-text-secondary hover:bg-bg-secondary'}`}>
              All Quizzes ({quizBank.length})
            </button>
            {navTree.map(({ label, icon, subjects }) => (
              <div key={label}>
                <button onClick={() => setOpenNav(p => ({ ...p, [label]: !p[label] }))}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-text-primary hover:bg-bg-secondary rounded-btn transition-colors">
                  <span>{icon} {label}</span>
                  {openNav[label] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {openNav[label] && subjects.map(sub => (
                  <button key={sub} onClick={() => { setSelectedTopic(sub); setSearchQuery(''); }}
                    className={`w-full text-left pl-10 pr-3 py-1.5 text-sm rounded-btn transition-colors ${selectedTopic === sub ? 'text-primary bg-bg-secondary font-medium' : 'text-text-secondary hover:text-primary'}`}>
                    {sub}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {quizStatus === 'idle' && (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {displayQuizzes.map((quiz, i) => (
                    <motion.div key={quiz.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="card p-6">
                      <h3 className="font-heading font-bold text-text-primary text-lg mb-3">📝 {quiz.title}</h3>
                      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <span className="flex items-center gap-1.5 text-text-secondary"><BarChart3 size={14} /> {quiz.questions.length} Questions</span>
                        <span className="flex items-center gap-1.5 text-text-secondary"><Clock size={14} /> {quiz.timeLimit} mins</span>
                        <span className="flex items-center gap-1.5 text-text-secondary">⭐ {quiz.difficulty}</span>
                        <span className="flex items-center gap-1.5 text-text-secondary"><Target size={14} /> {quiz.passingScore}% to pass</span>
                      </div>
                      <button onClick={() => startQuiz(quiz)} className="btn-primary w-full py-2.5 text-sm">Start Quiz</button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {quizStatus === 'active' && activeQuiz && (
              <motion.div key="question" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="card p-8 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-semibold text-text-primary">Question {currentQ + 1} of {activeQuiz.questions.length}</span>
                    <span className={`flex items-center gap-1.5 text-sm font-mono font-bold ${timeLeft < 60 ? 'text-error' : 'text-primary'}`}>
                      <Clock size={14} /> {formatTimer(timeLeft)}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-text-primary text-lg mb-6">{activeQuiz.questions[currentQ].question}</h3>
                  <div className="space-y-3 mb-8">
                    {activeQuiz.questions[currentQ].options.map((opt, oi) => (
                      <button key={oi} onClick={() => setAnswers(p => ({ ...p, [currentQ]: oi }))}
                        className={`w-full text-left p-4 rounded-btn border-2 text-sm transition-all ${
                          answers[currentQ] === oi ? 'border-primary bg-bg-secondary text-primary font-medium' : 'border-border hover:border-primary/40 text-text-secondary'
                        }`}>
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border mr-3 text-xs font-bold">{String.fromCharCode(65 + oi)}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                  {/* Progress dots */}
                  <div className="flex gap-1.5 justify-center mb-6">
                    {activeQuiz.questions.map((_, qi) => (
                      <button key={qi} onClick={() => setCurrentQ(qi)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${qi === currentQ ? 'bg-primary scale-125' : answers[qi] !== undefined ? 'bg-primary/40' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0}
                      className="btn-outline flex items-center gap-1 text-sm px-4 py-2 disabled:opacity-30"><ArrowLeft size={14} /> Previous</button>
                    {currentQ < activeQuiz.questions.length - 1 ? (
                      <button onClick={() => setCurrentQ(p => p + 1)} className="btn-primary flex items-center gap-1 text-sm px-4 py-2">Next <ArrowRight size={14} /></button>
                    ) : (
                      <button onClick={handleSubmit} className="px-6 py-2 bg-success text-white rounded-btn font-semibold text-sm hover:bg-green-600 transition-colors">Submit Quiz</button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {quizStatus === 'submitted' && result && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="card p-8 max-w-md mx-auto text-center">
                  <div className="text-5xl mb-4">{result.passed ? '🎉' : '📚'}</div>
                  <h2 className="font-heading font-extrabold text-text-primary text-2xl mb-2">Quiz Completed!</h2>
                  <div className="my-4">
                    <p className="text-4xl font-heading font-extrabold gradient-text mb-1">{result.correct}/{result.total}</p>
                    <p className="text-lg font-semibold text-text-primary">{result.percentage}%</p>
                  </div>
                  <span className={`badge text-sm px-4 py-1.5 ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {result.passed ? <><CheckCircle2 size={14} /> PASSED</> : <><XCircle size={14} /> NOT PASSED</>}
                  </span>
                  <p className="text-text-muted text-sm mt-3">Time: {formatTimer(result.timeTaken)}</p>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => { setQuizStatus('reviewing'); setCurrentQ(0); }} className="btn-outline flex-1 text-sm py-2.5">Review Answers</button>
                    <button onClick={() => startQuiz(activeQuiz)} className="btn-primary flex-1 flex items-center justify-center gap-1 text-sm py-2.5"><RotateCcw size={14} /> Retake</button>
                  </div>
                  <button onClick={() => { setQuizStatus('idle'); setActiveQuiz(null); }} className="mt-3 text-primary text-sm font-medium hover:underline">← Back to Quizzes</button>
                </div>
              </motion.div>
            )}

            {quizStatus === 'reviewing' && activeQuiz && (
              <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="card p-8 max-w-2xl mx-auto">
                  <h2 className="font-heading font-bold text-text-primary text-xl mb-6">Review Answers</h2>
                  <div className="space-y-6">
                    {activeQuiz.questions.map((q, qi) => {
                      const userAns = answers[qi]; const isCorrect = userAns === q.correctAnswer;
                      return (
                        <div key={qi} className={`p-4 rounded-card border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                          <p className="font-semibold text-text-primary text-sm mb-3">Q{qi + 1}: {q.question}</p>
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`text-sm py-1 px-3 rounded mb-1 ${oi === q.correctAnswer ? 'text-green-700 font-semibold' : oi === userAns && !isCorrect ? 'text-red-600 line-through' : 'text-text-secondary'}`}>
                              {String.fromCharCode(65 + oi)}. {opt} {oi === q.correctAnswer && ' ✓'} {oi === userAns && !isCorrect && ' ✗'}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => { setQuizStatus('idle'); setActiveQuiz(null); }} className="btn-primary w-full mt-6 py-2.5 text-sm">← Back to Quizzes</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default QuizzesPage;
