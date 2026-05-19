// ══════════════════════════════════════════════════════════
// src/data/courseData.js
// Centralised course data for the Web Development course.
// Each section carries its own YouTube videoId so the player
// can swap videos automatically when the user changes topics.
// ══════════════════════════════════════════════════════════

export const courseData = [

  // =================== HTML (video: HcOc7P5BMi4) ===================
  {
    id: 's1',
    section: 'Introduction',
    videoId: 'HcOc7P5BMi4',
    topics: [
      { id: 't1',  title: 'Intro',       start: 0,   end: 85  },
      { id: 't2',  title: 'VS Code',     start: 207, end: 339 },
      { id: 't3',  title: 'Basic Intro', start: 340, end: 503 },
    ],
  },
  {
    id: 's2',
    section: 'HTML Level 1',
    videoId: 'HcOc7P5BMi4',
    topics: [
      { id: 't4',  title: 'Basic HTML',              start: 504,  end: 755  },
      { id: 't5',  title: 'First HTML File',         start: 756,  end: 1158 },
      { id: 't6',  title: 'HTML Tags',               start: 1159, end: 1320 },
      { id: 't7',  title: 'Basic HTML Page',         start: 1321, end: 1703 },
      { id: 't8',  title: 'Quick Points',            start: 1703, end: 1925 },
      { id: 't9',  title: 'Comments in HTML',        start: 1925, end: 2066 },
      { id: 't10', title: 'HTML not case sensitive',  start: 2066, end: 2141 },
      { id: 't11', title: 'Assignment: Portfolio',   start: 2142, end: 2195 },
    ],
  },
  {
    id: 's3',
    section: 'HTML Level 2',
    videoId: 'HcOc7P5BMi4',
    topics: [
      { id: 't12', title: 'HTML Attributes',         start: 2196, end: 2312 },
      { id: 't13', title: 'Heading Tag',             start: 2313, end: 2467 },
      { id: 't14', title: 'Paragraph Tag',           start: 2467, end: 2572 },
      { id: 't15', title: 'Anchor Tag',              start: 2573, end: 2885 },
      { id: 't16', title: 'Image Tag',               start: 2886, end: 3222 },
      { id: 't17', title: 'BR Tag',                  start: 3222, end: 3252 },
      { id: 't18', title: 'Bold Italic Underline',   start: 3253, end: 3373 },
      { id: 't19', title: 'Big & Small Tags',        start: 3373, end: 3412 },
      { id: 't20', title: 'HR Tag',                  start: 3412, end: 3502 },
      { id: 't21', title: 'Subscript & Superscript', start: 3502, end: 3618 },
      { id: 't22', title: 'Pre Tag',                 start: 3618, end: 3716 },
      { id: 't23', title: 'Assignment',              start: 3717, end: 4285 },
    ],
  },
  {
    id: 's4',
    section: 'HTML Level 3',
    videoId: 'HcOc7P5BMi4',
    topics: [
      { id: 't24', title: 'Page Layout Techniques',  start: 4405, end: 4728 },
      { id: 't25', title: 'Inside Main Tag',         start: 4729, end: 4965 },
      { id: 't26', title: 'Revisiting Anchor Tag',   start: 4965, end: 5168 },
      { id: 't27', title: 'Div Tag',                 start: 5169, end: 5542 },
      { id: 't28', title: 'Span Tag',                start: 5542, end: 5665 },
      { id: 't29', title: 'Assignment',              start: 5665, end: 5704 },
    ],
  },
  {
    id: 's5',
    section: 'HTML Level Pro',
    videoId: 'HcOc7P5BMi4',
    topics: [
      { id: 't30', title: 'List in HTML',     start: 5710, end: 5966 },
      { id: 't31', title: 'Tables in HTML',   start: 5966, end: 6275 },
      { id: 't32', title: 'Thead & Tbody',    start: 6276, end: 6427 },
      { id: 't33', title: 'Forms in HTML',    start: 6428, end: 6712 },
      { id: 't34', title: 'Label',            start: 6713, end: 7040 },
      { id: 't35', title: 'Class & ID',       start: 7040, end: 7172 },
      { id: 't36', title: 'Checkbox',         start: 7172, end: 7424 },
      { id: 't37', title: 'Select Tag',       start: 7424, end: 7568 },
      { id: 't38', title: 'iFrame Tag',       start: 7569, end: 7818 },
      { id: 't39', title: 'Video Tag',        start: 7819, end: 8041 },
      { id: 't40', title: 'Final Assignment', start: 8042, end: 8139 },
    ],
  },

  // =================== CSS (video: ESnrn1kAD4E) ===================
  {
    id: 's6',
    section: 'CSS',
    videoId: 'ESnrn1kAD4E',
    topics: [
      { id: 'css_t1', title: 'Intro',              start: 0,   end: 105 },
      { id: 'css_t2', title: 'VS Code',            start: 105, end: 216 },
      { id: 'css_t3', title: 'CSS Basic Overview',  start: 216, end: 517 },
    ],
  },
  {
    id: 's7',
    section: 'CSS Level 1',
    videoId: 'ESnrn1kAD4E',
    topics: [
      { id: 'css_t4',  title: 'CSS Introduction',    start: 517,  end: 951  },
      { id: 'css_t5',  title: 'Basic Syntax',        start: 951,  end: 1194 },
      { id: 'css_t6',  title: 'Including Style',     start: 1194, end: 1444 },
      { id: 'css_t7',  title: 'External Stylesheet', start: 1444, end: 1728 },
      { id: 'css_t8',  title: 'Color Property',      start: 1728, end: 2049 },
      { id: 'css_t9',  title: 'Background Color',    start: 2050, end: 2384 },
      { id: 'css_t10', title: 'Color System',        start: 2384, end: 3397 },
      { id: 'css_t11', title: 'Selector',            start: 3397, end: 3895 },
      { id: 'css_t12', title: 'Practice Set 1',      start: 3895, end: 4646 },
      { id: 'css_t13', title: 'Text Properties',     start: 4646, end: 6122 },
      { id: 'css_t14', title: 'Units in CSS',        start: 6122, end: 6376 },
      { id: 'css_t15', title: 'Line Height',         start: 6376, end: 6458 },
      { id: 'css_t16', title: 'Text Transform',      start: 6458, end: 6532 },
      { id: 'css_t17', title: 'Practice Set 2',      start: 6532, end: 6944 },
    ],
  },
  {
    id: 's8',
    section: 'CSS Level 2',
    videoId: 'ESnrn1kAD4E',
    topics: [
      { id: 'css_t18', title: 'Box Model',         start: 6944,  end: 7288  },
      { id: 'css_t19', title: 'Height',            start: 7288,  end: 7428  },
      { id: 'css_t20', title: 'Width',             start: 7428,  end: 7571  },
      { id: 'css_t21', title: 'Border',            start: 7571,  end: 8171  },
      { id: 'css_t22', title: 'Padding',           start: 8171,  end: 8487  },
      { id: 'css_t23', title: 'Margin',            start: 8487,  end: 8689  },
      { id: 'css_t24', title: 'Practice Set 3',    start: 8689,  end: 9498  },
      { id: 'css_t25', title: 'Display Property',  start: 9498,  end: 10067 },
      { id: 'css_t26', title: 'Visibility',        start: 10067, end: 10110 },
      { id: 'css_t27', title: 'Alpha Channel',     start: 10110, end: 10353 },
      { id: 'css_t28', title: 'Practice Set 4',    start: 10353, end: 10968 },
    ],
  },
  {
    id: 's9',
    section: 'CSS Level 3',
    videoId: 'ESnrn1kAD4E',
    topics: [
      { id: 'css_t29', title: 'Units in CSS',      start: 10968, end: 11774 },
      { id: 'css_t30', title: 'Position',           start: 11774, end: 12701 },
      { id: 'css_t31', title: 'Z-Index',            start: 12701, end: 13011 },
      { id: 'css_t32', title: 'Background Image',   start: 13011, end: 13426 },
      { id: 'css_t33', title: 'Practice Set 5',     start: 13426, end: 13831 },
    ],
  },
  {
    id: 's10',
    section: 'CSS Level 4',
    videoId: 'ESnrn1kAD4E',
    topics: [
      { id: 'css_t34', title: 'Flexbox',            start: 13831, end: 14300 },
      { id: 'css_t35', title: 'Flexbox Direction',  start: 14300, end: 14632 },
      { id: 'css_t36', title: 'Flex Properties',    start: 14632, end: 15516 },
      { id: 'css_t37', title: 'Practice Set 6',     start: 15516, end: 16495 },
      { id: 'css_t38', title: 'Media Queries',      start: 16495, end: 16996 },
      { id: 'css_t39', title: 'Practice Set 7',     start: 16996, end: 17072 },
    ],
  },
  {
    id: 's11',
    section: 'CSS Level 5 – Pro',
    videoId: 'ESnrn1kAD4E',
    topics: [
      { id: 'css_t40', title: 'Transition',            start: 17072, end: 17944 },
      { id: 'css_t41', title: 'CSS Transform',         start: 17944, end: 18755 },
      { id: 'css_t42', title: 'Skew',                  start: 18755, end: 18819 },
      { id: 'css_t43', title: 'Animation',             start: 18819, end: 19071 },
      { id: 'css_t44', title: 'Animation Properties',  start: 19071, end: 19681 },
      { id: 'css_t45', title: '% in Animation',        start: 19681, end: 19770 },
      { id: 'css_t46', title: 'Practice Set 8',        start: 19770, end: 20312 },
    ],
  },
  {
    id: 's12',
    section: 'HTML + CSS Project',
    videoId: 'ESnrn1kAD4E',
    topics: [
      { id: 'css_t47', title: 'Amazon Clone Project', start: 20312, end: 26278 },
    ],
  },

  // =================== JAVASCRIPT (video: VlPiVmYuoqw) ===================
  {
    id: 's13',
    section: 'JavaScript',
    videoId: 'VlPiVmYuoqw',
    topics: [
      { id: 'js_t1',  title: 'Introduction',           start: 0,     end: 85    },
      { id: 'js_t2',  title: 'Variables & Data Types',  start: 85,    end: 4878  },
      { id: 'js_t3',  title: 'Operators',              start: 4878,  end: 9037  },
      { id: 'js_t4',  title: 'Loops',                  start: 9037,  end: 13410 },
      { id: 'js_t5',  title: 'Arrays',                 start: 13410, end: 16648 },
      { id: 'js_t6',  title: 'Functions',              start: 16648, end: 20340 },
      { id: 'js_t7',  title: 'DOM Part 1',             start: 20340, end: 24770 },
      { id: 'js_t8',  title: 'DOM Part 2',             start: 24770, end: 26244 },
      { id: 'js_t9',  title: 'Events',                 start: 26244, end: 28001 },
      { id: 'js_t10', title: 'Building Game',          start: 28001, end: 30498 },
      { id: 'js_t11', title: 'Classes',                start: 30498, end: 31200 },
      { id: 'js_t12', title: 'Callback',               start: 31200, end: 38274 },
      { id: 'js_t13', title: 'Fetch API',              start: 38274, end: 39975 },
    ],
  },
];

// Pre-computed helpers
// IMPORTANT: Each topic inherits its parent section's videoId so that
// VideoPlayer can switch between YouTube videos (HTML/CSS/JS) correctly.
export const allTopics = courseData.flatMap((s) =>
  s.topics.map((t) => ({ ...t, videoId: s.videoId }))
);
export const TOTAL_TOPICS = allTopics.length;
export const COURSE_ID = 'web-development';
