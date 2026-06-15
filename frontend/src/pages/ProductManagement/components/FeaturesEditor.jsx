import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import ImageUpload from '../../../components/admin/ImageUpload';

const FeaturesEditor = ({ features, setFeatures }) => {
  const addBlock = () => {
    setFeatures([...features, { title: '', description: '', image: '' }]);
  };

  const updateBlock = (index, updates) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], ...updates };
    setFeatures(newFeatures);
  };

  const removeBlock = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const editableBlocks = features
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block?.type !== 'gallery');

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-8">
        {editableBlocks.map(({ block, index }) => (
          <div key={index} className="relative space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-5">
            <button 
              type="button"
              onClick={() => removeBlock(index)}
              className="absolute right-4 top-4 text-slate-400 hover:text-rose-500"
              aria-label="Xóa"
            >
              <Trash2 size={18} />
            </button>
            
            <div className="space-y-4 pr-8">
              <input 
                className="form-input font-bold"
                value={block.title || ''}
                onChange={(e) => updateBlock(index, { title: e.target.value })}
                placeholder="Tiêu đề đoạn (Không bắt buộc)"
              />
              <textarea 
                rows="4"
                className="form-textarea"
                value={block.description || ''}
                onChange={(e) => updateBlock(index, { description: e.target.value })}
                placeholder="Nhập nội dung mô tả chi tiết..."
              />
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-500">Hình ảnh minh họa</p>
                <ImageUpload 
                  value={block.image || ''}
                  onChange={(val) => updateBlock(index, { image: val })}
                  folder="features"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        type="button"
        onClick={addBlock}
        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
      >
        <Plus size={16} /> Thêm đoạn mô tả
      </button>
    </div>
  );
};

export default FeaturesEditor;
