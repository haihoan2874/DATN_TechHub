import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Sparkles,
  Bot
} from 'lucide-react';

const SlifeAdvisor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Xin chào! Tôi là S-Life AI Advisor. Tôi có thể giúp bạn chọn thiết bị chăm sóc sức khỏe phù hợp nhất. Bạn đang quan tâm đến dòng sản phẩm nào?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    
    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'Cảm ơn sếp đã quan tâm! Dựa trên nhu cầu của sếp, tôi gợi ý dòng Apple Watch Series 9 cho tính năng đo điện tâm đồ (ECG) chính xác nhất.' 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-500/40 z-[100] flex items-center justify-center border border-white/20 backdrop-blur-sm"
      >
        <Sparkles size={28} className="animate-pulse" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 100, x: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 100, x: 20 }}
              className="fixed bottom-28 right-8 w-[90%] max-w-[400px] h-[600px] bg-white rounded-[3rem] shadow-2xl z-[120] flex flex-col overflow-hidden border border-slate-100"
            >
              {/* Header */}
              <div className="p-8 bg-blue-600 text-white relative">
                <div className="absolute top-0 right-0 p-6">
                  <button onClick={() => setIsOpen(false)} className="hover:scale-90 transition-transform">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                      <Bot size={24} />
                   </div>
                   <div>
                      <h3 className="text-lg font-black italic uppercase tracking-tighter">S-Life Advisor</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70 italic">Online & Ready</span>
                      </div>
                   </div>
                </div>
                <p className="text-[10px] font-black italic uppercase tracking-widest opacity-80 leading-relaxed">
                   Tư vấn thiết bị sức khỏe thông minh bằng trí tuệ nhân tạo (Google Gemini)
                </p>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
                {messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: msg.role === 'bot' ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] p-5 rounded-3xl text-xs font-bold italic leading-relaxed shadow-sm ${
                      msg.role === 'bot' 
                      ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none' 
                      : 'bg-blue-600 text-white rounded-tr-none'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white border-t border-slate-100">
                <div className="relative flex items-center gap-3">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Hỏi về Garmin, Apple Watch..." 
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold italic focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                  <button 
                    onClick={handleSend}
                    className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SlifeAdvisor;
