import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Maximize2, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosConfig';

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
    if (!user || !input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axiosClient.post('/ai/consult', userMessage, {
        headers: { 'Content-Type': 'text/plain' }
      });
      
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Xin lỗi, tôi đang gặp chút vấn đề kỹ thuật. Bạn vui lòng thử lại sau nhé!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] flex justify-end sm:inset-x-auto sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-500 ${
              isMinimized
                ? 'h-14 w-full sm:h-16 sm:w-80'
                : 'h-[min(520px,calc(100vh-130px))] w-full sm:h-[560px] sm:w-[380px]'
            }`}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between bg-slate-900 p-3 text-white sm:p-4">
               <div className="flex items-center gap-3">
	                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 sm:h-9 sm:w-9 sm:rounded-2xl">
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
                    type="button"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                  </button>
                  <button 
                    type="button"
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
	                  <div className="flex flex-grow flex-col items-center justify-center bg-slate-50/50 px-5 py-8 text-center sm:p-8">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Lock size={28} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-3">Yêu cầu đăng nhập</h4>
	                    <p className="mb-8 max-w-xs text-xs font-medium leading-relaxed text-slate-500">
                      Vui lòng đăng nhập tài khoản S-LIFE để bắt đầu sử dụng trợ lý tư vấn AI thông minh.
                    </p>
                    <Link 
                      to="/login" 
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl bg-slate-900 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-blue-600"
                    >
                      Đăng nhập ngay
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    <div 
                      ref={scrollRef}
	                      className="custom-scrollbar flex-grow space-y-4 overflow-y-auto bg-slate-50/50 p-3 sm:space-y-5 sm:p-4"
                    >
                      {messages.map((msg, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: msg.role === 'ai' ? -10 : 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                        >
	                          <div className={`flex max-w-[92%] gap-2 sm:max-w-[85%] sm:gap-3 ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
	                             <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${
                               msg.role === 'ai' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                             }`}>
                                {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                             </div>
	                             <div className={`rounded-2xl p-3 text-xs font-medium leading-relaxed sm:p-4 ${
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
	                    <div className="shrink-0 border-t border-slate-100 bg-white p-3 sm:p-4">
                       <div className="relative">
                          <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
	                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
	                            placeholder="Hỏi về sản phẩm, thông số…"
	                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3.5 pl-4 pr-12 text-xs font-medium outline-none transition-all focus:ring-2 focus:ring-blue-600/10"
                          />
                          <button 
                            type="button"
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
	                            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors hover:bg-blue-600 disabled:opacity-30"
                          >
                            <Send size={16} />
                          </button>
                       </div>
	                       <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:mt-4">Powered by Gemini 1.5 Flash</p>
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
          className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] sm:h-14 sm:w-14"
        >
          <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <MessageSquare size={24} className="relative z-10" />
          <div className="absolute top-0 right-0 p-2">
             <span className="w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900 block" />
          </div>
        </motion.button>
      )}
    </div>
  );
};

export default AIChatbot;
