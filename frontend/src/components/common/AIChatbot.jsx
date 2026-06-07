import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Maximize2, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosConfig';
import { resolveApiAssetUrl } from '../../config/api';
import { formatCurrency } from '../../utils/formatters';

const QUICK_PROMPTS = [
  'Tư vấn đồng hồ dưới 5 triệu',
  'Tôi cần thiết bị chạy bộ có GPS',
  'Sản phẩm nào theo dõi giấc ngủ tốt?',
  'Gợi ý vòng đeo sức khỏe pin lâu'
];

const INITIAL_MESSAGES = [
  {
    role: 'ai',
    content: 'Chào bạn! Tôi là S-Life AI Advisor. Tôi có thể giúp bạn chọn smartwatch, vòng đeo sức khỏe hoặc phụ kiện phù hợp với nhu cầu sử dụng. Bạn đang quan tâm đến sản phẩm nào?'
  }
];

const AIChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (message) => {
    const userMessage = message.trim();
    if (!user || !userMessage || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axiosClient.post('/ai/consult', { message: userMessage });
      
      setMessages(prev => [...prev, {
        role: 'ai',
        content: response?.answer || 'Tôi chưa có câu trả lời phù hợp. Bạn vui lòng mô tả nhu cầu cụ thể hơn.',
        suggestedProducts: response?.suggestedProducts || []
      }]);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Xin lỗi, hệ thống tư vấn đang gặp sự cố. Bạn vui lòng thử lại sau.';
      setMessages(prev => [...prev, { role: 'ai', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] flex justify-end sm:inset-x-auto sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_-22px_rgba(15,23,42,0.45)] transition-all duration-500 ${
              isMinimized
                ? 'h-14 w-full sm:h-16 sm:w-80'
                : 'h-[min(560px,calc(100vh-112px))] w-full sm:h-[600px] sm:w-[400px]'
            }`}
          >
            {/* Header */}
            <div className="shrink-0 border-b border-slate-800 bg-slate-950 px-4 py-3.5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-950/30">
                    <Sparkles size={19} className="fill-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black uppercase tracking-[0.18em]">S-Life AI</h3>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Đang hỗ trợ</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label={isMinimized ? 'Mở rộng chat' : 'Thu nhỏ chat'}
                  >
                    {isMinimized ? <Maximize2 size={17} /> : <Minimize2 size={17} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Đóng chat"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {!user ? (
                  <div className="flex flex-grow flex-col items-center justify-center bg-slate-50 px-5 py-8 text-center sm:p-8">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                      <Lock size={28} />
                    </div>
                    <h4 className="mb-3 text-sm font-black uppercase tracking-tight text-slate-900">Yêu cầu đăng nhập</h4>
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
                      className="custom-scrollbar flex-grow space-y-4 overflow-y-auto bg-slate-50 px-3 py-4 sm:p-4"
                    >
                      {messages.map((msg, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: msg.role === 'ai' ? -10 : 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`flex max-w-[94%] gap-2.5 sm:max-w-[88%] ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                              msg.role === 'ai' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                                {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                             </div>
                            <div className={`rounded-[1.35rem] px-3.5 py-3 text-sm font-medium leading-relaxed shadow-sm ${
                              msg.role === 'ai'
                                ? 'border border-slate-200 bg-white text-slate-800'
                                : 'bg-slate-950 text-white'
                            }`}>
                                <div className="whitespace-pre-line">{msg.content}</div>
                                {msg.suggestedProducts?.length > 0 && (
                                  <div className="mt-3">
                                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                      Sản phẩm gợi ý
                                    </p>
                                    <div className="custom-scrollbar max-h-56 space-y-2 overflow-y-auto pr-1">
                                      {msg.suggestedProducts.slice(0, 4).map((product) => (
                                      <Link
                                        key={product.id}
                                        to={`/product/${product.slug}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition-colors hover:border-blue-200 hover:bg-blue-50"
                                      >
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-slate-100">
                                          <img
                                            src={resolveApiAssetUrl(product.imageUrl)}
                                            alt={product.name}
                                            className="h-full w-full object-contain"
                                            loading="lazy"
                                            decoding="async"
                                          />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="line-clamp-2 text-xs font-black leading-snug text-slate-900">{product.name}</p>
                                          <p className="mt-1 text-xs font-black text-blue-700">{formatCurrency(product.price)}</p>
                                          <p className="text-[10px] font-bold text-slate-400">Tồn kho: {product.stockQuantity ?? 0}</p>
                                        </div>
                                      </Link>
                                      ))}
                                    </div>
                                  </div>
                                )}
                             </div>
                          </div>
                        </motion.div>
                      ))}

                      {messages.length === 1 && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Gợi ý nhanh</p>
                          <div className="grid grid-cols-1 gap-2">
                            {QUICK_PROMPTS.map((prompt) => (
                              <button
                                key={prompt}
                                type="button"
                                onClick={() => sendMessage(prompt)}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-xs font-bold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-500 shadow-sm">
                            <Loader2 size={14} className="animate-spin text-blue-600" />
                            S-Life AI đang phân tích nhu cầu...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner shadow-slate-200/40 focus-within:border-blue-300 focus-within:bg-white">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Nhập nhu cầu, ngân sách hoặc sản phẩm..."
                          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={handleSend}
                          disabled={!input.trim() || isLoading}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300"
                          aria-label="Gửi tin nhắn"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                      <p className="mt-2 text-center text-[10px] font-bold text-slate-400">Hỗ trợ tư vấn, thông tin sản phẩm lấy từ S-LIFE.</p>
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
