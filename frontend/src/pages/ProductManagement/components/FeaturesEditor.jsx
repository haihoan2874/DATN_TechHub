import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import ImageUpload from '../../../components/admin/ImageUpload';

const FeaturesEditor = ({ features, setFeatures }) => {
  // Use internal state with IDs to prevent React re-rendering issues
  const [blocks, setBlocks] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const parsed = Array.isArray(features) ? features : [];
    const editable = parsed.filter(b => b?.type !== 'gallery');
    
    // Only initialize if we haven't yet, to prevent overwriting active edits
    setBlocks(prev => {
      if (prev.length === 0 && editable.length > 0) {
        return editable.map(b => ({ ...b, _id: `block-${Date.now()}-${Math.random()}` }));
      }
      return prev;
    });
  }, []); // Run once on mount

  const notifyChange = (newBlocks) => {
    // Merge with gallery if it exists
    const galleryBlock = Array.isArray(features) ? features.find(b => b?.type === 'gallery') : null;
    const cleanBlocks = newBlocks.map(({ _id, ...rest }) => rest);
    
    if (galleryBlock) {
      setFeatures([...cleanBlocks, galleryBlock]);
    } else {
      setFeatures(cleanBlocks);
    }
  };

  const addBlock = () => {
    const newId = `block-${Date.now()}`;
    const newBlocks = [...blocks, { _id: newId, title: '', description: '', image: '' }];
    setBlocks(newBlocks);
    setExpandedId(newId);
    notifyChange(newBlocks);
  };

  const updateBlock = (id, updates) => {
    const newBlocks = blocks.map(b => b._id === id ? { ...b, ...updates } : b);
    setBlocks(newBlocks);
    notifyChange(newBlocks);
  };

  const removeBlock = (id) => {
    const newBlocks = blocks.filter(b => b._id !== id);
    setBlocks(newBlocks);
    notifyChange(newBlocks);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {blocks.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500 border-2 border-dashed border-slate-100 rounded-xl">
          Chưa có đoạn mô tả chi tiết nào.
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => {
            const isExpanded = expandedId === block._id;
            return (
              <div key={block._id} className={`rounded-xl border transition-all duration-200 overflow-hidden ${isExpanded ? 'border-blue-200 shadow-md ring-1 ring-blue-100' : 'border-slate-200 hover:border-slate-300'}`}>
                
                {/* Header / Summary */}
                <div 
                  className={`flex items-center gap-3 p-4 cursor-pointer ${isExpanded ? 'bg-blue-50/50' : 'bg-slate-50'}`}
                  onClick={() => setExpandedId(isExpanded ? null : block._id)}
                >
                  <div className="flex-1 truncate font-semibold text-slate-800">
                    {block.title || `Đoạn mô tả ${index + 1}`}
                  </div>
                  {block.image && <ImageIcon size={16} className="text-emerald-500" />}
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeBlock(block._id); }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Content */}
                {isExpanded && (
                  <div className="p-5 bg-white border-t border-slate-100 space-y-5">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Tiêu đề đoạn</label>
                      <input 
                        className="form-input text-base font-semibold"
                        value={block.title || ''}
                        onChange={(e) => updateBlock(block._id, { title: e.target.value })}
                        placeholder="VD: Màn hình Super AMOLED siêu nét..."
                      />
                    </div>
                    
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Nội dung mô tả</label>
                      <textarea 
                        rows="4"
                        className="form-textarea leading-relaxed text-slate-700"
                        value={block.description || ''}
                        onChange={(e) => updateBlock(block._id, { description: e.target.value })}
                        placeholder="Viết nội dung chi tiết cho đoạn này..."
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Hình ảnh minh họa</label>
                      <div className="max-w-md">
                        <ImageUpload 
                          value={block.image || ''}
                          onChange={(val) => updateBlock(block._id, { image: val })}
                          folder="features"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button 
        type="button"
        onClick={addBlock}
        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-colors w-full justify-center mt-2 border border-blue-100 border-dashed"
      >
        <Plus size={18} /> Thêm đoạn mô tả mới
      </button>
    </div>
  );
};

export default FeaturesEditor;
