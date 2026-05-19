import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/User.js';
import Course from './models/Course.js';
import Section from './models/Section.js';
import Lecture from './models/Lecture.js';
import Quiz from './models/Quiz.js';
import UserProgress from './models/UserProgress.js';

const seed = async () => {
  await connectDB();
  console.log('🌱 Starting seed...\n');

  // ── Wipe ──────────────────────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Section.deleteMany({}),
    Lecture.deleteMany({}),
    Quiz.deleteMany({}),
    UserProgress.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Users ─────────────────────────────────────────────────────────────────
  const password = await bcrypt.hash('Test@1234', 10);

  const [adminUser, student1, student2] = await User.insertMany([
    {
      fullName: 'Admin User',
      email: 'admin@lms.dev',
      password,
      role: 'admin',
      isVerified: true,
      authProvider: 'local',
    },
    {
      fullName: 'Devesh Dhakate',
      email: 'devesh@lms.dev',
      password,
      role: 'student',
      isVerified: true,
      authProvider: 'local',
    },
    {
      fullName: 'Riya Sharma',
      email: 'riya@lms.dev',
      password,
      role: 'student',
      isVerified: true,
      authProvider: 'local',
    },
  ]);
  console.log('✅ Users created:', [adminUser, student1, student2].map(u => u.email).join(', '));

  // ── Lectures helper ────────────────────────────────────────────────────────
  const createLectures = async (titles) => {
    const docs = titles.map((title, i) => ({
      title,
      duration: Math.floor(Math.random() * 20 + 5) * 60,
      videoUrl: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
      order: i + 1,
      isPreview: i === 0,
      resources: [],
    }));
    return await Lecture.insertMany(docs);
  };

  // ── Course 1: Web Development ─────────────────────────────────────────────
  const webSect1Lecs = await createLectures([
    'HTML5 Fundamentals & Semantics',
    'CSS3 Layouts — Flexbox & Grid',
    'Responsive Design Principles',
    'CSS Animations & Transitions',
  ]);
  const webSect2Lecs = await createLectures([
    'JavaScript ES6+ Deep Dive',
    'DOM Manipulation Mastery',
    'Async JS — Promises & Async/Await',
    'Fetch API & AJAX',
  ]);
  const webSect3Lecs = await createLectures([
    'React — Components & JSX',
    'React Hooks — useState & useEffect',
    'React Router & Navigation',
    'Redux Toolkit & State Management',
    'Building a Full React App',
  ]);
  const webSect4Lecs = await createLectures([
    'Node.js & Express Setup',
    'REST API Design',
    'MongoDB & Mongoose',
    'JWT Authentication',
    'Deployment with Render & Vercel',
  ]);

  const webSect1 = await Section.create({ title: 'HTML & CSS Foundations', order: 1, lectures: webSect1Lecs.map(l => l._id) });
  const webSect2 = await Section.create({ title: 'JavaScript Mastery', order: 2, lectures: webSect2Lecs.map(l => l._id) });
  const webSect3 = await Section.create({ title: 'React — Modern Frontend', order: 3, lectures: webSect3Lecs.map(l => l._id) });
  const webSect4 = await Section.create({ title: 'Node.js — Backend & API', order: 4, lectures: webSect4Lecs.map(l => l._id) });

  const webCourse = await Course.create({
    title: 'Web Development',
    slug: 'web-development',
    subtitle: 'Complete Full Stack Web Development Course',
    description: 'Master HTML, CSS, JavaScript, React, Node.js, Express, and MongoDB. Build real-world full-stack projects and land your dream job.',
    instructor: adminUser._id,
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800',
    icon: '💻',
    gradient: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    sections: [webSect1._id, webSect2._id, webSect3._id, webSect4._id],
    totalLectures: 18,
    totalDuration: 18 * 12 * 60,
    enrolledUsers: [student1._id, student2._id],
    category: 'Web Development',
    difficulty: 'Beginner',
    accessUntil: new Date('2027-12-31'),
    isPublished: true,
    tags: ['html', 'css', 'javascript', 'react', 'nodejs', 'mongodb'],
  });

  // ── Course 2: AI/ML ────────────────────────────────────────────────────────
  const aiSect1Lecs = await createLectures([
    'Python for Data Science',
    'NumPy & Pandas Fundamentals',
    'Data Visualization with Matplotlib',
  ]);
  const aiSect2Lecs = await createLectures([
    'Machine Learning Basics',
    'Linear & Logistic Regression',
    'Decision Trees & Random Forests',
    'Support Vector Machines',
  ]);
  const aiSect3Lecs = await createLectures([
    'Deep Learning Fundamentals',
    'Neural Networks with TensorFlow',
    'Convolutional Neural Networks (CNN)',
    'Recurrent Neural Networks (RNN)',
    'Transformers & Attention Mechanism',
  ]);

  const aiSect1 = await Section.create({ title: 'Python & Data Science', order: 1, lectures: aiSect1Lecs.map(l => l._id) });
  const aiSect2 = await Section.create({ title: 'Classical Machine Learning', order: 2, lectures: aiSect2Lecs.map(l => l._id) });
  const aiSect3 = await Section.create({ title: 'Deep Learning & Neural Nets', order: 3, lectures: aiSect3Lecs.map(l => l._id) });

  const aiCourse = await Course.create({
    title: 'AI/ML Masterclass',
    slug: 'ai-ml',
    subtitle: 'Complete AI & Machine Learning Program',
    description: 'From Python basics to advanced deep learning. Master ML algorithms, neural networks, and deploy AI models in production.',
    instructor: adminUser._id,
    thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    icon: '🤖',
    gradient: 'linear-gradient(135deg, #667EEA, #764BA2)',
    sections: [aiSect1._id, aiSect2._id, aiSect3._id],
    totalLectures: 12,
    totalDuration: 12 * 15 * 60,
    enrolledUsers: [student1._id],
    category: 'Artificial Intelligence',
    difficulty: 'Intermediate',
    accessUntil: new Date('2027-12-31'),
    isPublished: true,
    tags: ['python', 'machine learning', 'deep learning', 'tensorflow', 'ai'],
  });

  // ── Course 3: Python Programming ──────────────────────────────────────────
  const pySect1Lecs = await createLectures([
    'Python Setup & First Program',
    'Variables, Data Types & Operators',
    'Strings & String Methods',
    'Lists, Tuples & Dictionaries',
    'Control Flow — if/else & loops',
  ]);
  const pySect2Lecs = await createLectures([
    'Functions & Lambda Expressions',
    'OOP — Classes & Objects',
    'Inheritance & Polymorphism',
    'File Handling & Exception Handling',
  ]);

  const pySect1 = await Section.create({ title: 'Python Basics', order: 1, lectures: pySect1Lecs.map(l => l._id) });
  const pySect2 = await Section.create({ title: 'Advanced Python', order: 2, lectures: pySect2Lecs.map(l => l._id) });

  const pythonCourse = await Course.create({
    title: 'Python Programming',
    slug: 'python-programming',
    subtitle: 'Beginner to Advanced Python with Projects & AI Apps',
    description: 'Complete Python Programming Course from Beginner to Advanced with Projects and AI-based Applications.',
    instructor: adminUser._id,
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
    icon: '🐍',
    gradient: 'linear-gradient(135deg, #3776AB, #FFD43B)',
    sections: [pySect1._id, pySect2._id],
    totalLectures: 32,
    totalDuration: 39055,
    enrolledUsers: [student1._id, student2._id],
    category: 'Programming',
    difficulty: 'Beginner',
    accessUntil: new Date('2027-12-31'),
    isPublished: true,
    tags: ['python', 'programming', 'oop', 'data structures', 'ai'],
  });

  console.log('✅ Courses created:', [webCourse, aiCourse, pythonCourse].map(c => c.title).join(', '));

  // ── User Progress ──────────────────────────────────────────────────────────
  await UserProgress.create({
    user: student1._id,
    course: webCourse._id,
    completedLectures: webSect1Lecs.map(l => ({ lecture: l._id })).concat(
      webSect2Lecs.map(l => ({ lecture: l._id }))
    ).concat(webSect3Lecs.slice(0, 3).map(l => ({ lecture: l._id }))),
    progressPercentage: 61,
    lastWatched: { lecture: webSect3Lecs[2]._id, timestamp: 320, watchedAt: new Date() },
  });
  await UserProgress.create({
    user: student1._id,
    course: aiCourse._id,
    completedLectures: aiSect1Lecs.map(l => ({ lecture: l._id })),
    progressPercentage: 25,
    lastWatched: { lecture: aiSect1Lecs[2]._id, timestamp: 150, watchedAt: new Date() },
  });
  console.log('✅ User progress created');

  // ── Quizzes ────────────────────────────────────────────────────────────────
  await Quiz.insertMany([
    {
      title: 'HTML & CSS Basics',
      description: 'Test your knowledge of HTML structure and CSS styling.',
      subject: 'Web Development',
      topic: 'HTML & CSS',
      difficulty: 'Easy',
      course: webCourse._id,
      timeLimit: 600,
      passingScore: 60,
      isPublished: true,
      questions: [
        {
          text: 'Which HTML tag is used to define an internal style sheet?',
          options: ['<script>', '<style>', '<css>', '<head>'],
          correctAnswer: 1,
          explanation: 'The <style> tag is used to define internal CSS in HTML.',
          points: 1,
        },
        {
          text: 'Which CSS property controls the text size?',
          options: ['font-weight', 'text-size', 'font-size', 'text-style'],
          correctAnswer: 2,
          explanation: 'font-size controls the size of text in CSS.',
          points: 1,
        },
        {
          text: 'What does CSS stand for?',
          options: ['Computer Style Sheet', 'Cascading Style Sheet', 'Creative Style Sheet', 'Colorful Style Sheet'],
          correctAnswer: 1,
          explanation: 'CSS stands for Cascading Style Sheets.',
          points: 1,
        },
        {
          text: 'Which HTML attribute specifies an alternate text for an image if the image cannot be displayed?',
          options: ['title', 'longdesc', 'alt', 'src'],
          correctAnswer: 2,
          explanation: 'The alt attribute provides alternative text for an image.',
          points: 1,
        },
        {
          text: 'Which CSS property is used to change the background color?',
          options: ['color', 'bgcolor', 'background-color', 'background'],
          correctAnswer: 2,
          explanation: 'background-color sets the background color of an element.',
          points: 1,
        },
      ],
    },
    {
      title: 'JavaScript Fundamentals',
      description: 'Core JavaScript concepts — variables, functions, and DOM.',
      subject: 'Web Development',
      topic: 'JavaScript',
      difficulty: 'Medium',
      course: webCourse._id,
      timeLimit: 900,
      passingScore: 70,
      isPublished: true,
      questions: [
        {
          text: 'Which keyword declares a block-scoped variable in JavaScript?',
          options: ['var', 'let', 'const', 'define'],
          correctAnswer: 1,
          explanation: 'let declares a block-scoped variable (unlike var which is function-scoped).',
          points: 1,
        },
        {
          text: 'What does the === operator check?',
          options: ['Value only', 'Type only', 'Value and type', 'None of the above'],
          correctAnswer: 2,
          explanation: '=== is the strict equality operator, checking both value and type.',
          points: 1,
        },
        {
          text: 'Which method adds an element to the end of an array?',
          options: ['push()', 'pop()', 'shift()', 'unshift()'],
          correctAnswer: 0,
          explanation: 'push() adds elements to the end of an array.',
          points: 1,
        },
        {
          text: 'What is a closure in JavaScript?',
          options: [
            'A function with no return value',
            'A function having access to its outer scope even after the outer function returns',
            'A method to close browser tabs',
            'A way to terminate loops',
          ],
          correctAnswer: 1,
          explanation: 'A closure is a function that retains access to its lexical scope.',
          points: 2,
        },
        {
          text: 'What will typeof null return?',
          options: ['"null"', '"undefined"', '"object"', '"boolean"'],
          correctAnswer: 2,
          explanation: 'typeof null returns "object" — this is a known JavaScript quirk.',
          points: 1,
        },
        {
          text: 'Which method converts a JSON string to a JavaScript object?',
          options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.objectify()'],
          correctAnswer: 1,
          explanation: 'JSON.parse() parses a JSON string and returns a JavaScript object.',
          points: 1,
        },
      ],
    },
    {
      title: 'Python Basics Quiz',
      description: 'Test your fundamental Python knowledge.',
      subject: 'Programming',
      topic: 'Python',
      difficulty: 'Easy',
      course: pythonCourse._id,
      timeLimit: 600,
      passingScore: 60,
      isPublished: true,
      questions: [
        {
          text: 'Which of the following is the correct way to create a list in Python?',
          options: ['list = (1, 2, 3)', 'list = [1, 2, 3]', 'list = {1, 2, 3}', 'list = <1, 2, 3>'],
          correctAnswer: 1,
          explanation: 'Lists in Python are created using square brackets [].',
          points: 1,
        },
        {
          text: 'What is the output of print(type(5.0))?',
          options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'num'>"],
          correctAnswer: 1,
          explanation: '5.0 is a floating-point number, so its type is float.',
          points: 1,
        },
        {
          text: 'Which keyword is used to define a function in Python?',
          options: ['function', 'func', 'def', 'define'],
          correctAnswer: 2,
          explanation: 'Functions in Python are defined using the def keyword.',
          points: 1,
        },
        {
          text: 'What does len() function do?',
          options: ['Converts to string', 'Returns length of an object', 'Sorts a list', 'Reverses a string'],
          correctAnswer: 1,
          explanation: 'len() returns the number of items in an object.',
          points: 1,
        },
      ],
    },
    {
      title: 'Machine Learning Concepts',
      description: 'Foundational ML concepts and algorithms.',
      subject: 'AI/ML',
      topic: 'Machine Learning',
      difficulty: 'Hard',
      course: aiCourse._id,
      timeLimit: 1200,
      passingScore: 75,
      isPublished: true,
      questions: [
        {
          text: 'Which type of machine learning uses labeled data?',
          options: ['Unsupervised Learning', 'Reinforcement Learning', 'Supervised Learning', 'Semi-Supervised Learning'],
          correctAnswer: 2,
          explanation: 'Supervised learning trains on labeled input-output pairs.',
          points: 1,
        },
        {
          text: 'What is overfitting in ML?',
          options: [
            'Model performs well on both training and test data',
            'Model performs well on training data but poorly on test data',
            'Model performs poorly on all data',
            'Model trains too slowly',
          ],
          correctAnswer: 1,
          explanation: 'Overfitting means the model memorizes training data but fails to generalize.',
          points: 2,
        },
        {
          text: 'Which algorithm is used for classification problems?',
          options: ['Linear Regression', 'K-Means Clustering', 'Logistic Regression', 'PCA'],
          correctAnswer: 2,
          explanation: 'Logistic Regression is used for binary classification problems.',
          points: 1,
        },
        {
          text: 'What does the "learning rate" control in gradient descent?',
          options: ['Number of training epochs', 'Step size in parameter update', 'Size of training dataset', 'Number of hidden layers'],
          correctAnswer: 1,
          explanation: 'The learning rate controls how large each step is during gradient descent optimization.',
          points: 2,
        },
      ],
    },
  ]);

  console.log('✅ Quizzes created (4 quizzes)');

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete!\n');
  console.log('📋 Test Accounts:');
  console.log('   Admin  → admin@lms.dev   / Test@1234');
  console.log('   Student → devesh@lms.dev  / Test@1234');
  console.log('   Student → riya@lms.dev    / Test@1234\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
