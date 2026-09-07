'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Bot, Send, Sparkles, WifiOff, Trash2, Loader2 } from 'lucide-react';
import { isOnline } from '@/lib/offlineStorage';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: { content: string; source: string }[];
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm the **NCCT AI Assistant** 🤖\n\nI can help you with:\n- 📋 Cooperative laws and regulations\n- 📊 Accounting practices for cooperatives\n- 🏢 Management and governance\n- 💼 Employment guidance in the cooperative sector\n\nAsk me anything about cooperatives!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setOnline(isOnline());
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage.content,
          history: messages
            .filter((m) => m.id !== 'welcome')
            .slice(-6)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: online
          ? '⚠️ Something went wrong. Please try again.'
          : '📴 You are offline. AI responses require an internet connection. Previously cached Q&As are still available in your history.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Chat cleared! How can I help you with cooperative capacity building?",
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>
            <Bot size={24} style={{ display: 'inline', verticalAlign: '-4px', marginRight: '0.5rem' }} />
            AI Assistant
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            <Sparkles size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Powered by
            RAG + Groq LLM
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {!online && (
            <span className="badge badge-amber">
              <WifiOff size={10} /> Offline
            </span>
          )}
          <button className="btn btn-ghost btn-sm" onClick={clearChat}>
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      <div className="chat-container">
        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}

              {/* Source citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <strong>Sources:</strong>
                  {msg.sources.map((s, i) => (
                    <div key={i} style={{ marginTop: '0.25rem' }}>
                      📄 {s.source || `Reference ${i + 1}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="chat-bubble chat-bubble-ai">
              <div className="typing-indicator">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <form onSubmit={handleSubmit} className="chat-input-wrapper">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder={
                online
                  ? 'Ask anything about cooperatives...'
                  : 'You are offline — new queries need internet'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary btn-icon"
              disabled={loading || !input.trim()}
              style={{ flexShrink: 0, width: '2.75rem', height: '2.75rem' }}
            >
              {loading ? <Loader2 size={18} className="spinner" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
