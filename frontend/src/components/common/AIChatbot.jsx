import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Maximize2, Sparkles, Lock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const AIChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Chào bạn! Tôi là S-Life AI Advisor. Tôi có thể giúp bạn chọn đồng hồ thông minh hoặc thiết bị sức khỏe phù hợp nhất. Bạn đang quan tâm đến dòng sản phẩm nào?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8089/api/v1/ai/consult', userMessage, {
        headers: { 'Content-Type': 'text/plain' }
      });
      
      setMessages(prev => [...prev, { role: 'ai', content: response.data }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Xin lỗi, tôi đang gặp chút vấn đề kỹ thuật. Bạn vui lòng thử lại sau nhé!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col overflow-hidden transition-all duration-500 ${
              isMinimized ? 'h-20 w-80' : 'h-[600px] w-[400px]'
            }`}
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                     <Sparkles size={20} className="fill-white" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black uppercase tracking-widest">S-Life AI</h3>
                     <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X size={18} />
                  </button>
               </div>
            </div>

            {!isMinimized && (
              <>
                {!user ? (
                  <div className="flex-grow p-10 flex flex-col items-center justify-center text-center bg-slate-50/50">
                    <div className="w-20 h-20 rounded-[2rem] bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                      <Lock size={32} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-3">Yêu cầu đăng nhập</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">
                      Vui lòng đăng nhập tài khoản TechHub để bắt đầu sử dụng trợ lý tư vấn AI thông minh.
                    </p>
                    <Link 
                      to="/login" 
                      onClick={() => setIsOpen(false)}
                      className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                    >
                      Đăng nhập ngay
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div 
                      ref={scrollRef}
                      className="flex-grow p-6 overflow-y-auto space-y-6 bg-slate-50/50 custom-scrollbar"
                    >
                      {messages.map((msg, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: msg.role === 'ai' ? -10 : 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[85%] flex gap-3 ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                             <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                               msg.role === 'ai' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                             }`}>
                                {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                             </div>
                             <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                               msg.role === 'ai' ? 'bg-white shadow-sm border border-slate-100 text-slate-800' : 'bg-slate-900 text-white'
                             }`}>
                                {msg.content}
                             </div>
                          </div>
                        </motion.div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                           <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-400 italic">
                              <Loader2 size={14} className="animate-spin" />
                              S-Life AI đang suy nghĩ...
                           </div>
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                       <div className="relative">
                          <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Hỏi về sản phẩm, thông số..."
                            className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/10 transition-all text-xs font-medium"
                          />
                          <button 
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all disabled:opacity-30"
                          >
                            <Send size={16} />
                          </button>
                       </div>
                       <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">Powered by Gemini 1.5 Flash</p>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] flex items-center justify-center relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <MessageSquare size={28} className="relative z-10" />
          <div className="absolute top-0 right-0 p-2">
             <span className="w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900 block" />
          </div>
        </motion.button>
      )}
    </div>
  );
};

export default AIChatbot;
