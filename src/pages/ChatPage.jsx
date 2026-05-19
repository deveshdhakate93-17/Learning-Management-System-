import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Plus, Search, MessageSquare, Send, Paperclip, Mic, Copy, Check,
  ThumbsUp, ThumbsDown, RefreshCw, Trash2, MoreHorizontal, X, Menu,
  FileText, Code, Bug, Globe, Brain, Edit3, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sendMessage, generateTitle, saveChat, loadChat, saveChatIndex, loadChatIndex, deleteChat, exportChat } from '../services/aiService';
import LMSLogo from '../components/shared/LMSLogo';

const suggestions = [
  { icon: FileText, title: 'Generate Notes', desc: 'Create study notes', prompt: 'Generate comprehensive study notes for React hooks including useState, useEffect, and useRef with code examples' },
  { icon: Code, title: 'Explain Code', desc: 'Code explanations', prompt: 'Explain how JavaScript closures work with practical examples' },
  { icon: Brain, title: 'Create Quiz', desc: 'Test your knowledge', prompt: 'Create a 5-question quiz about CSS Flexbox with answers' },
  { icon: Bug, title: 'Solve Errors', desc: 'Debug your code', prompt: 'I\'m getting "Cannot read properties of undefined" in React. How do I fix this?' },
  { icon: Globe, title: 'Web Dev Help', desc: 'Frontend & Backend', prompt: 'What are the best practices for building a REST API with Node.js and Express?' },
  { icon: Brain, title: 'AI/ML Questions', desc: 'Machine learning', prompt: 'Explain the difference between supervised and unsupervised learning with examples' },
];

const ChatPage = () => {
  const { user } = useSelector((s) => s.auth);
  const [chatIndex, setChatIndex] = useState(() => loadChatIndex());
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

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

  const handleSend = async (text = input.trim()) => {
    if (!text || isStreaming) return;
    const userMsg = { role: 'user', content: text, timestamp: Date.now() };
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
        newMessages.map(m => ({ role: m.role, content: m.content })),
        (chunk) => {
          aiMsg.content += chunk;
          setMessages(prev => [...prev.slice(0, -1), { ...aiMsg }]);
        },
        async (fullText) => {
          aiMsg.content = fullText;
          const finalMessages = [...newMessages, aiMsg];
          setMessages(finalMessages);
          saveChat(chatId, finalMessages);

          // Update index
          const existingIdx = chatIndex.findIndex(c => c.id === chatId);
          let title = chatIndex[existingIdx]?.title;
          if (!title) {
            try { title = await generateTitle(text); } catch { title = text.slice(0, 40); }
          }
          const updatedIndex = existingIdx >= 0
            ? chatIndex.map(c => c.id === chatId ? { ...c, updatedAt: Date.now() } : c)
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
      const updatedIndex = [{ id: chatId, title: text.slice(0, 40), createdAt: Date.now(), updatedAt: Date.now() }, ...chatIndex.filter(c => c.id !== chatId)];
      setChatIndex(updatedIndex);
      saveChatIndex(updatedIndex);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const copyMessage = (content, id) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied!');
  };

  const handleDeleteChat = (chatId) => {
    deleteChat(chatId);
    const updated = chatIndex.filter(c => c.id !== chatId);
    setChatIndex(updated);
    saveChatIndex(updated);
    if (activeChatId === chatId) { setActiveChatId(null); setMessages([]); }
  };

  const filteredChats = chatIndex.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--chat-bg)' }}>
      {/* Top nav bar for Chat — minimal */}
      <div className="h-[52px] flex items-center justify-between px-4 border-b flex-shrink-0" style={{ background: 'var(--chat-sidebar)', borderColor: 'var(--chat-border)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white p-1.5"><Menu size={18} /></button>
          <LMSLogo size={28} />
          <span className="font-heading font-bold text-white text-sm hidden sm:block">LMS AI Chat</span>
        </div>
        <button onClick={createNewChat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-sm font-medium text-gray-300 hover:bg-chat-card transition-colors">
          <Plus size={15} /> New Chat
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }} className="flex-shrink-0 flex flex-col overflow-hidden border-r" style={{ background: 'var(--chat-sidebar)', borderColor: 'var(--chat-border)' }}>
              <div className="p-3">
                <button onClick={createNewChat}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-btn text-sm text-gray-200 font-medium transition-colors hover:bg-chat-card" style={{ border: '1px solid var(--chat-border)' }}>
                  <Plus size={15} /> New Chat
                </button>
              </div>
              <div className="px-3 mb-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" placeholder="Search chats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field-dark pl-9 text-xs py-2" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto dark-scroll px-2">
                {filteredChats.map(chat => (
                  <button key={chat.id} onClick={() => loadExistingChat(chat.id)}
                    className={`w-full group flex items-center gap-2 px-3 py-2.5 rounded-btn text-left text-sm transition-colors mb-0.5 ${
                      activeChatId === chat.id ? 'bg-chat-card text-white' : 'text-gray-400 hover:bg-chat-card hover:text-gray-200'
                    }`}>
                    <MessageSquare size={14} className="flex-shrink-0 text-gray-500" />
                    <span className="flex-1 truncate">{chat.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 transition-opacity"><Trash2 size={12} /></button>
                  </button>
                ))}
                {filteredChats.length === 0 && <p className="text-gray-600 text-xs text-center py-4">No chats yet</p>}
              </div>
              {/* User */}
              <div className="p-3 border-t" style={{ borderColor: 'var(--chat-border)' }}>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-chat-accent to-green-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.fullName?.[0] || 'U'}
                  </div>
                  <span className="text-gray-300 text-sm truncate">{user?.fullName || 'User'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto dark-scroll px-4 py-6">
            {messages.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-2xl bg-chat-card flex items-center justify-center mb-6" style={{ border: '1px solid var(--chat-border)' }}>
                  <LMSLogo size={40} />
                </motion.div>
                <h2 className="font-heading font-bold text-white text-2xl mb-8">How can I help you today?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {suggestions.map(({ icon: Icon, title, desc, prompt }) => (
                    <button key={title} onClick={() => { setInput(prompt); handleSend(prompt); }}
                      className="flex items-start gap-3 p-4 rounded-card text-left transition-all hover:bg-chat-card group"
                      style={{ border: '1px solid var(--chat-border)' }}>
                      <Icon size={18} className="text-gray-500 mt-0.5 group-hover:text-chat-accent transition-colors" />
                      <div><p className="text-white text-sm font-medium">{title}</p><p className="text-gray-500 text-xs">{desc}</p></div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-chat-accent flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                    )}
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-primary rounded-2xl rounded-br-md px-4 py-3 text-white text-sm' : ''}`}>
                      {msg.role === 'assistant' ? (
                        <div className="group">
                          <div className="prose prose-invert prose-sm max-w-none text-gray-200 text-sm leading-relaxed">
                            <ReactMarkdown
                              components={{
                                code({ inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const lang = match ? match[1] : '';
                                  if (!inline && lang) {
                                    return (
                                      <div className="relative my-3 rounded-btn overflow-hidden" style={{ border: '1px solid var(--chat-border)' }}>
                                        <div className="flex items-center justify-between px-3 py-1.5 text-xs" style={{ background: '#2f2f2f' }}>
                                          <span className="text-gray-400">{lang}</span>
                                          <button onClick={() => copyMessage(String(children), `code-${i}-${lang}`)}
                                            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                                            {copiedId === `code-${i}-${lang}` ? <Check size={12} /> : <Copy size={12} />}
                                            <span>{copiedId === `code-${i}-${lang}` ? 'Copied' : 'Copy'}</span>
                                          </button>
                                        </div>
                                        <SyntaxHighlighter style={oneDark} language={lang} PreTag="div"
                                          customStyle={{ margin: 0, padding: '12px 16px', fontSize: '13px', background: '#1a1a1a' }}>
                                          {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                      </div>
                                    );
                                  }
                                  return <code className="bg-chat-card px-1.5 py-0.5 rounded text-chat-accent text-xs font-mono" {...props}>{children}</code>;
                                },
                              }}
                            >{msg.content || '...'}</ReactMarkdown>
                          </div>
                          {/* Actions */}
                          <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => copyMessage(msg.content, i)} className="p-1.5 text-gray-500 hover:text-white rounded transition-colors">
                              {copiedId === i ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                            <button className="p-1.5 text-gray-500 hover:text-white rounded transition-colors"><ThumbsUp size={13} /></button>
                            <button className="p-1.5 text-gray-500 hover:text-white rounded transition-colors"><ThumbsDown size={13} /></button>
                          </div>
                        </div>
                      ) : (
                        <span>{msg.content}</span>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">{user?.fullName?.[0] || 'U'}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
                {isStreaming && messages[messages.length - 1]?.content === '' && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm ml-11">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse-dot" />
                      <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
                    </span>
                    AI is thinking...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--chat-border)' }}>
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-2 p-2 rounded-card" style={{ background: 'var(--chat-card)', border: '1px solid var(--chat-border)' }}>
                <button className="p-2 text-gray-500 hover:text-gray-300 transition-colors"><Paperclip size={17} /></button>
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Ask anything..." rows={1}
                  className="flex-1 bg-transparent text-white text-sm outline-none resize-none placeholder-gray-500 py-2 max-h-32"
                  style={{ fontFamily: 'var(--font-body)' }} />
                <button className="p-2 text-gray-500 hover:text-gray-300 transition-colors"><Mic size={17} /></button>
                <button onClick={() => handleSend()} disabled={!input.trim() || isStreaming}
                  className={`p-2 rounded-btn transition-all ${input.trim() && !isStreaming ? 'bg-chat-accent text-white hover:bg-green-600' : 'text-gray-600'}`}>
                  <Send size={17} />
                </button>
              </div>
              <p className="text-center text-gray-600 text-[10px] mt-2">LMS AI can make mistakes. Verify important information.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
