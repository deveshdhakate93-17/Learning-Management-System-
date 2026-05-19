// Chat controller — proxies AI requests if you want server-side AI calls
// The current frontend calls AI APIs directly (client-side),
// but this controller provides a server-side alternative for production use.

export const sendChatMessage = async (req, res) => {
  try {
    const { messages, provider = 'openai' } = req.body;
    if (!messages?.length) return res.status(400).json({ message: 'Messages required' });

    const SYSTEM_PROMPT = `You are LMS AI Assistant, an expert coding tutor helping students master Web Development, DSA, AI/ML, Python, and UI/UX. Provide clear, structured explanations with code examples. Use markdown formatting.`;

    if (provider === 'gemini') {
      const GEMINI_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_KEY) return res.status(500).json({ message: 'Gemini API key not configured' });

      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${GEMINI_KEY}&alt=sse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
          }),
        }
      );

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }
      res.end();
    } else {
      // OpenAI
      const OPENAI_KEY = process.env.OPENAI_API_KEY;
      if (!OPENAI_KEY) return res.status(500).json({ message: 'OpenAI API key not configured' });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          stream: true,
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }
      res.end();
    }
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) res.status(500).json({ message: err.message });
  }
};

export const generateChatTitle = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    // Simple title generation — truncate first message
    const title = message.length > 40
      ? message.slice(0, 40).trim() + '...'
      : message;

    res.json({ title });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
