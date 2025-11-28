import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Book } from 'lucide-react';
import { chatWithLibrarian } from '../services/geminiService';
import { ChatMessage } from '../types';

export const LibrarianChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Good day! I am Eleanor, the head librarian here. How may I assist you in your literary journey today?', timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Format history for API
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const responseText = await chatWithLibrarian(history, userMsg.text);

    setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-library-paper rounded-lg shadow-2xl flex flex-col overflow-hidden border border-library-wood/20 animate-fade-in-up">
          {/* Header */}
          <div className="bg-library-wood text-library-gold p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-library-gold/20 p-1.5 rounded-full">
                <Book size={18} className="text-library-gold" />
              </div>
              <div>
                <h3 className="font-serif font-bold">Eleanor</h3>
                <p className="text-xs text-library-gold/70">Chief Librarian</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper-pattern">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-library-wood text-white rounded-tr-none' 
                      : 'bg-white text-library-wood-light border border-stone-200 rounded-tl-none'
                  }`}
                >
                  {msg.role === 'model' && <p className="text-[10px] text-library-wood/50 font-bold mb-1 uppercase tracking-wider">Eleanor</p>}
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-stone-200">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-library-wood/40 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-library-wood/40 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-library-wood/40 rounded-full animate-bounce delay-200"></div>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-library-wood/10">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for a recommendation..."
                className="flex-1 bg-stone-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-library-gold focus:outline-none text-library-wood"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-library-wood text-library-gold p-2 rounded-full hover:bg-library-wood-light transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-library-wood-light text-white' : 'bg-library-wood text-library-gold hover:scale-105'
        }`}
      >
        <span className={`font-serif font-bold overflow-hidden transition-all duration-300 ${isOpen ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          Ask the Librarian
        </span>
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};
