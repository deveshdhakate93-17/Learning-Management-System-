import { useState, useRef, useCallback, useEffect } from 'react';
import { sendMessage, generateTitle, saveChat, loadChat, saveChatIndex, loadChatIndex, deleteChat } from '../services/aiService';

const useChat = () => {
  const [chatIndex, setChatIndex] = useState(() => loadChatIndex());
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const createNewChat = useCallback(() => {
    const id = `chat_${Date.now()}`;
    setActiveChatId(id);
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  }, []);

  const loadExistingChat = useCallback((chatId) => {
    setActiveChatId(chatId);
    setMessages(loadChat(chatId));
  }, []);

  const handleSend = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || isStreaming) return;

    const userMsg = { role: 'user', content, timestamp: Date.now() };
    let chatId = activeChatId;
    if (!chatId) { chatId = `chat_${Date.now()}`; setActiveChatId(chatId); }

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    const aiMsg = { role: 'assistant', content: '', timestamp: Date.now() };
    setMessages([...newMessages, aiMsg]);

    try {
      await sendMessage(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        (chunk) => {
          aiMsg.content += chunk;
          setMessages((prev) => [...prev.slice(0, -1), { ...aiMsg }]);
        },
        async (fullText) => {
          aiMsg.content = fullText;
          const finalMessages = [...newMessages, aiMsg];
          setMessages(finalMessages);
          saveChat(chatId, finalMessages);

          const existingIdx = chatIndex.findIndex((c) => c.id === chatId);
          let title = chatIndex[existingIdx]?.title;
          if (!title) {
            try { title = await generateTitle(content); } catch { title = content.slice(0, 40); }
          }
          const updatedIndex = existingIdx >= 0
            ? chatIndex.map((c) => (c.id === chatId ? { ...c, updatedAt: Date.now() } : c))
            : [{ id: chatId, title, createdAt: Date.now(), updatedAt: Date.now() }, ...chatIndex];
          setChatIndex(updatedIndex);
          saveChatIndex(updatedIndex);
          setIsStreaming(false);
        }
      );
    } catch (err) {
      aiMsg.content = `⚠️ Error: ${err.message}\n\nPlease add your API key to the \`.env\` file:\n\`\`\`\nVITE_OPENAI_API_KEY=sk-...\n# or\nVITE_GEMINI_API_KEY=...\nVITE_AI_PROVIDER=gemini\n\`\`\``;
      setMessages([...newMessages, aiMsg]);
      saveChat(chatId, [...newMessages, aiMsg]);
      const updatedIndex = [
        { id: chatId, title: content.slice(0, 40), createdAt: Date.now(), updatedAt: Date.now() },
        ...chatIndex.filter((c) => c.id !== chatId),
      ];
      setChatIndex(updatedIndex);
      saveChatIndex(updatedIndex);
      setIsStreaming(false);
    }
  }, [input, isStreaming, activeChatId, messages, chatIndex]);

  const handleDeleteChat = useCallback((chatId) => {
    deleteChat(chatId);
    const updated = chatIndex.filter((c) => c.id !== chatId);
    setChatIndex(updated);
    saveChatIndex(updated);
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
  }, [chatIndex, activeChatId]);

  return {
    chatIndex,
    activeChatId,
    messages,
    input,
    isStreaming,
    messagesEndRef,
    inputRef,
    setInput,
    createNewChat,
    loadExistingChat,
    handleSend,
    handleDeleteChat,
  };
};

export default useChat;
