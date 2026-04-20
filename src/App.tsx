/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Phone, 
  BookOpen, 
  FileText, 
  Calendar, 
  Menu, 
  X,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, Role } from './types';
import { chatWithGemini } from './services/geminiService';
import { ASU_COLORS, QUICK_ACTIONS } from './constants';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Welcome, Sun Devil! 🔱 I'm your ASU Online assistant. I can help you with course catalogs, university policies, or connect you with a success coach. What can I help you with today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Prepare history for Gemini
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }]
      }));

      const response = await chatWithGemini(userMsg.content, history);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: 'error',
        role: 'assistant',
        content: "Oops! I encountered an error connecting to the Sun Devil Network. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (actionId: string) => {
    let query = '';
    switch (actionId) {
      case 'policies': query = "What are the key university policies I should know about?"; break;
      case 'courses': query = "How can I search the ASU Online course catalog?"; break;
      case 'support': query = "How do I get in touch with my Success Coach?"; break;
      case 'schedule': query = "What are the session dates for this semester?"; break;
    }
    if (query) {
      setInput(query);
      // We'll let the user see the prompt before they hit send, or we could auto-send.
      // Auto-sending feels smoother.
      // setTimeout to allow state to settle for the input field.
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      // We need to wait for input state to update or just pass query directly to handleSend
    }
  };

  // Special version of handleSend for quick actions
  const triggerQuickAction = async (query: string) => {
    if (isTyping) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }]
      }));
      const response = await chatWithGemini(query, history);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#fcfcfc] text-[#1a1a1a] font-sans">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-asu-maroon text-white transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
             <div className="p-2 bg-asu-gold rounded-xl">
               <Sparkles className="w-6 h-6 text-asu-maroon" />
             </div>
             <div>
               <h1 className="font-display text-xl font-bold leading-tight">Sun Devil</h1>
               <p className="text-xs text-asu-gold font-medium uppercase tracking-wider">Support Hub</p>
             </div>
             <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto p-2 hover:bg-white/10 rounded-lg">
               <X className="w-5 h-5" />
             </button>
          </div>

          <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-2">
            <h2 className="px-2 text-[10px] uppercase tracking-widest text-white/50 mb-4 font-bold">Recommended Resources</h2>
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.id}
                onClick={() => {
                  triggerQuickAction(action.label);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors group text-sm text-left"
              >
                {action.id === 'policies' && <FileText className="w-4 h-4 text-asu-gold" />}
                {action.id === 'courses' && <BookOpen className="w-4 h-4 text-asu-gold" />}
                {action.id === 'support' && <User className="w-4 h-4 text-asu-gold" />}
                {action.id === 'schedule' && <Calendar className="w-4 h-4 text-asu-gold" />}
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-white/10">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xs text-white/70 mb-3">Questions about enrollment?</p>
              <a href="tel:+18552785080" className="flex items-center gap-2 text-asu-gold font-bold hover:underline">
                <Phone className="w-4 h-4" />
                855-278-5080
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center px-6 border-bottom border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-asu-maroon flex items-center justify-center text-asu-gold">
               <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm">Sun Devil AI</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide">Live Support</p>
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
             <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
               <ExternalLink className="w-3 h-3" />
               Canvas
             </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'assistant' ? 'bg-asu-maroon text-asu-gold' : 'bg-asu-gold text-asu-maroon'
                }`}>
                  {message.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={`max-w-[85%] md:max-w-[70%] ${message.role === 'user' ? 'text-right' : ''}`}>
                   <div className={`inline-block p-4 rounded-2xl text-sm leading-relaxed border ${
                     message.role === 'assistant' 
                     ? 'bg-white text-gray-800 border-gray-100 shadow-sm' 
                     : 'bg-asu-maroon text-white border-asu-maroon'
                   }`}>
                     <div className="flex flex-col gap-1">
                        <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
                        <span className="text-[10px] opacity-50 mt-2 block">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-asu-maroon flex items-center justify-center text-asu-gold">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 bg-white border border-gray-100 px-4 py-3 rounded-2xl shadow-sm">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <footer className="p-4 md:p-6 bg-white border-t border-gray-100">
           <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3 relative">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about ASU policies, courses, or support..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-asu-maroon/20 focus:border-asu-maroon transition-all"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-asu-maroon text-asu-gold rounded-xl disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
           </form>
           <p className="text-[10px] text-center text-gray-400 mt-4 font-medium uppercase tracking-widest">
             Provided by ASU Online Student Success • Powered by Gemini AI
           </p>
        </footer>
      </main>
    </div>
  );
}
