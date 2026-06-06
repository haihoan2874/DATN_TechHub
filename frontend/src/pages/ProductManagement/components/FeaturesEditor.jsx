import React, { useState } from 'react';
import { 
  Type, Trash2, 
  ImageIcon, Plus, ChevronDown, 
  ChevronUp, Edit3, Image as LucideImage
} from 'lucide-react';
import ImageUpload from '../../../components/admin/ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';

const FeaturesEditor = ({ features, setFeatures }) => {
  const [expandedIdx, setExpandedIdx] = useState(0);
  const editableBlocks = features
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block?.type !== 'gallery');

  const addBlock = (type) => {
    const newBlock = { 
      type, 
      title: '', 
      description: '', 
      image: '',
    };
    const newFeatures = [...features, newBlock];
    setFeatures(newFeatures);
    setExpandedIdx(newFeatures.length - 1);
  };

  const updateBlock = (index, updates) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], ...updates };
    setFeatures(newFeatures);
  };

  const removeBlock = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col space-y-8 bg-white">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Mô tả chi tiết</h3>
        <p className="text-xs text-slate-400">Xây dựng nội dung dài gồm tiêu đề, đoạn mô tả và hình ảnh minh họa.</p>
        
        <div className="flex gap-4">
           <button 
             type="button"
             onClick={() => addBlock('text-image')}
             className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10"
             aria-label="Thêm đoạn mô tả sản phẩm"
           >
             <Type size={16} /> Thêm đoạn văn bản
           </button>
           <button 
             type="button"
             onClick={() => addBlock('image-only')}
             className="flex-1 flex items-center justify-center gap-3 py-4 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
             aria-label="Thêm hình ảnh mô tả sản phẩm"
           >
             <LucideImage size={16} /> Thêm hình ảnh
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-10">
        <AnimatePresence mode="popLayout">
          {editableBlocks.map(({ block, index }) => (
            <motion.div 
              key={index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden"
            >
               <div 
                 onClick={() => setExpandedIdx(expandedIdx === index ? -1 : index)}
                 className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
               >
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] font-black text-slate-300">#{index + 1}</span>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 truncate max-w-[200px]">
                      {block.title || (block.type === 'image-only' ? 'HÌNH ẢNH MINH HỌA' : 'ĐOẠN VĂN BẢN MỚI')}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeBlock(index); }}
                      aria-label={`Xóa khối mô tả ${index + 1}`}
                      className="p-2 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    {expandedIdx === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
               </div>

               {expandedIdx === index && (
                 <div className="p-6 pt-2 space-y-6 border-t border-slate-200/50">
                    {block.type === 'text-image' && (
                      <div className="space-y-4">
                        <input 
                          className="form-input font-bold"
                          value={block.title}
                          onChange={(e) => updateBlock(index, { title: e.target.value })}
                          placeholder="Tiêu đề đoạn (Không bắt buộc)..."
                        />
                        <textarea 
                          rows="6"
                          className="form-textarea"
                          value={block.description}
                          onChange={(e) => updateBlock(index, { description: e.target.value })}
                          placeholder="Nhập nội dung mô tả chi tiết tại đây..."
                        />
                      </div>
                    )}
                    
                    <div className="space-y-3">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Hình ảnh minh họa</p>
                       <ImageUpload 
                         value={block.image}
                         onChange={(val) => updateBlock(index, { image: val })}
                         folder="products/features"
                       />
                    </div>
                 </div>
               )}
            </motion.div>
          ))}
        </AnimatePresence>

        {editableBlocks.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 opacity-40">
             <Edit3 size={48} className="text-slate-300 mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bắt đầu xây dựng nội dung mô tả</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturesEditor;
