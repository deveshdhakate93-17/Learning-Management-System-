const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent`;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const PROVIDER = import.meta.env.VITE_AI_PROVIDER || 'groq';

const SYSTEM_PROMPT = `You are LMS AI Assistant, an expert coding tutor helping students master:
- Web Development (HTML, CSS, JavaScript, React, Node.js, MongoDB)
- Data Structures & Algorithms (DSA)
- AI & Machine Learning
- Python Programming
- UI/UX Design

Always provide clear, structured explanations with code examples when relevant.
Use markdown formatting for better readability.
Be encouraging, precise, and educational in your responses.`;

// ✅ Groq (Free + Fast)
export const sendMessageGroq = async (messages, onChunk, onDone) => {
  if (!GROQ_KEY) throw new Error('Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file.');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Groq API error');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
    for (const line of lines) {
      const json = line.slice(6).trim();
      if (json === '[DONE]') { onDone(fullText); return; }
      try {
        const parsed = JSON.parse(json);
        const delta = parsed.choices?.[0]?.delta?.content || '';
        if (delta) { fullText += delta; onChunk(delta); }
      } catch { }
    }
  }
  onDone(fullText);
};

// OpenAI
export const sendMessageOpenAI = async (messages, onChunk, onDone) => {
  if (!OPENAI_KEY) throw new Error('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file.');

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API error');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
    for (const line of lines) {
      const json = line.slice(6).trim();
      if (json === '[DONE]') { onDone(fullText); return; }
      try {
        const parsed = JSON.parse(json);
        const delta = parsed.choices?.[0]?.delta?.content || '';
        if (delta) { fullText += delta; onChunk(delta); }
      } catch { }
    }
  }
  onDone(fullText);
};

// Gemini
export const sendMessageGemini = async (messages, onChunk, onDone) => {
  if (!GEMINI_KEY) throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_KEY}&alt=sse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gemini API error');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      const json = line.slice(6).trim();
      try {
        const parsed = JSON.parse(json);
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) { fullText += text; onChunk(text); }
      } catch { }
    }
  }
  onDone(fullText);
};

// ✅ Unified — Provider ke hisaab se call hoga
export const sendMessage = async (messages, onChunk, onDone) => {
  if (PROVIDER === 'gemini') return sendMessageGemini(messages, onChunk, onDone);
  if (PROVIDER === 'groq') return sendMessageGroq(messages, onChunk, onDone);
  return sendMessageOpenAI(messages, onChunk, onDone);
};

// Title generate
export const generateTitle = async (firstMessage) => {
  if (!GROQ_KEY && !OPENAI_KEY && !GEMINI_KEY) return firstMessage.slice(0, 40) + '...';
  try {
    const url = GROQ_KEY ? GROQ_API_URL : OPENAI_API_URL;
    const key = GROQ_KEY || OPENAI_KEY;
    const model = GROQ_KEY ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: `Generate a short 4-5 word title for a chat that starts with: "${firstMessage}". Respond with only the title, no quotes.` }],
        max_tokens: 20,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || firstMessage.slice(0, 40);
  } catch { return firstMessage.slice(0, 40); }
};

// localStorage chat persistence
export const saveChat = (chatId, messages) => {
  localStorage.setItem(`lms_chat_${chatId}`, JSON.stringify(messages));
};

export const loadChat = (chatId) => {
  const data = localStorage.getItem(`lms_chat_${chatId}`);
  return data ? JSON.parse(data) : [];
};

export const saveChatIndex = (chats) => {
  localStorage.setItem('lms_chat_index', JSON.stringify(chats));
};

export const loadChatIndex = () => {
  const data = localStorage.getItem('lms_chat_index');
  return data ? JSON.parse(data) : [];
};

export const deleteChat = (chatId) => {
  localStorage.removeItem(`lms_chat_${chatId}`);
};

export const exportChat = (messages) => {
  const content = messages.map(m =>
    `**${m.role === 'user' ? 'You' : 'LMS AI'}:** ${m.content}`
  ).join('\n\n---\n\n');
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lms-chat-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
};