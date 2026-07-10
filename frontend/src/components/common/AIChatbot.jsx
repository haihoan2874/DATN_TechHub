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

  // Hàm render Markdown phân cấp cha - con
  const renderMessageContent = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Xóa text-slate-900 để tự kế thừa màu (trắng hoặc đen tùy role)
          return <strong key={j} className="font-extrabold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      const trimmedLine = line.trim();
      const isListItem = trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ');
      
      if (isListItem) {
        const leadingSpaces = line.match(/^\s*/)[0].length;
        const isChild = leadingSpaces > 0;
        const indentClass = isChild ? "ml-5" : "";

        return (
          <div key={i} className={`flex items-start gap-2 mt-1.5 ${indentClass}`}>
            <span className={`shrink-0 rounded-full shadow-sm ${isChild ? 'h-1.5 w-1.5 bg-slate-400 mt-1.5' : 'h-2 w-2 bg-blue-500 mt-1.5'}`}></span>
            <span className="flex-1">
              {parts.map((p, k) => <React.Fragment key={k}>{typeof p === 'string' ? p.replace(/^\s*[\*\-]\s/, '') : p}</React.Fragment>)}
            </span>
          </div>
        );
      }
      
      // Xóa text-slate-700
      return <div key={i} className={i > 0 ? "mt-1" : ""}>{parts}</div>;
    });
  };

  return (
    <div className="fixed inset-x-3 bottom-3 z-[90] flex justify-end sm:inset-x-auto sm:bottom-8 sm:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_100px_-15px_rgba(15,23,42,0.5)] transition-all duration-300 ${
              isMinimized
                ? 'h-auto w-full sm:w-[360px]'
                : 'h-[min(580px,calc(100vh-100px))] w-full sm:h-[620px] sm:w-[420px]'
            }`}
          >
            {/* Header */}
            <div className="shrink-0 bg-slate-950 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-slate-900 border border-slate-800 shadow-inner overflow-hidden p-1.5">
                    <img src="/logo_transparent.png" alt="S-LIFE AI" className="h-full w-full object-contain scale-110 drop-shadow-sm" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-extrabold uppercase tracking-wide text-white">S-Life AI</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Đang hỗ trợ</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                    aria-label={isMinimized ? 'Mở rộng chat' : 'Thu nhỏ chat'}
                  >
                    {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                    aria-label="Đóng chat"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {!user ? (
                  <div className="flex flex-grow flex-col items-center justify-center bg-slate-50 px-6 py-10 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[20px] bg-white text-slate-800 shadow-sm border border-slate-200">
                      <Lock size={32} />
                    </div>
                    <h4 className="mb-3 text-base font-extrabold uppercase tracking-widest text-slate-900">Yêu cầu đăng nhập</h4>
                    <p className="mb-8 max-w-[260px] text-xs font-medium leading-relaxed text-slate-500">
                      Vui lòng đăng nhập tài khoản S-LIFE để bắt đầu sử dụng trợ lý tư vấn AI thông minh.
                    </p>
                    <Link 
                      to="/login" 
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl bg-slate-950 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-blue-600 hover:scale-105"
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
                                <div className="text-[13px] sm:text-sm">{renderMessageContent(msg.content)}</div>
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
                                          <p className="text-[10px] font-bold text-slate-400">Kho: {product.stockQuantity ?? 0}</p>
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
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex justify-start"
                        >
                          <div className="flex max-w-[94%] gap-2.5 sm:max-w-[88%] flex-row">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm bg-blue-600 text-white">
                                <Bot size={16} />
                             </div>
                            <div className="flex items-center gap-3 rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
                                <div className="flex gap-1.5 items-center">
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-[13px] font-bold text-slate-500">Đang phân tích...</span>
                             </div>
                          </div>
                        </motion.div>
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
          aria-label="Mở trợ lý tư vấn AI"
          className="group relative flex h-14 w-14 items-center justify-center rounded-[18px] bg-slate-950 text-white shadow-[0_8px_30px_rgb(0,0,0,0.24)] border border-slate-800 transition-shadow hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)]"
        >
          <div className="absolute inset-0 rounded-[18px] bg-gradient-to-tr from-blue-600 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          <MessageSquare size={24} className="relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:text-white text-slate-300" />
          
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-500"></span>
          </span>
        </motion.button>
      )}
    </div>
  );
};

export default AIChatbot;
