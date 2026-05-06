import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, X, Settings2, 
  Zap, Search, List
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const SpecsEditor = ({ specs, setSpecs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Common attribute presets for Shopee-style specs
  const presets = [
    "Thương hiệu", "Nguồn gốc", "Chất liệu", "Kích thước", 
    "Trọng lượng", "Màu sắc", "Bảo hành", "Loại thiết bị"
  ];

  // Flatten nested specs for editing if they exist, or keep as is
  const flatSpecs = useMemo(() => {
    let parsed = {};
    try {
      parsed = typeof specs === 'string' ? JSON.parse(specs) : specs || {};
    } catch (e) {
      parsed = {};
    }

    const isCategorized = Object.values(parsed).some(val => typeof val === 'object' && val !== null && !Array.isArray(val));
    
    if (isCategorized) {
      const flattened = {};
      Object.entries(parsed).forEach(([group, items]) => {
        if (typeof items === 'object' && items !== null && !Array.isArray(items)) {
          Object.entries(items).forEach(([k, v]) => {
            flattened[`${group}: ${k}`] = v;
          });
        } else {
          flattened[group] = items;
        }
      });
      return flattened;
    }
    return parsed;
  }, [specs]);

  const updateSpec = (key, value) => {
    setSpecs({ ...flatSpecs, [key]: value });
  };

  const addSpec = (key = "") => {
    setSpecs({ ...flatSpecs, [key || `Thông số ${Object.keys(flatSpecs).length + 1}`]: "" });
  };

  const removeSpec = (key) => {
    const newSpecs = { ...flatSpecs };
    delete newSpecs[key];
    setSpecs(newSpecs);
  };

  const renameKey = (oldKey, newKey) => {
    if (oldKey === newKey || !newKey.trim()) return;
    const newSpecs = { ...flatSpecs };
    const value = newSpecs[oldKey];
    delete newSpecs[oldKey];
    newSpecs[newKey] = value;
    setSpecs(newSpecs);
  };

  return (
    <div className="h-full flex flex-col space-y-6 bg-white">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">CHI TIẾT SẢN PHẨM (Attribute Editor)</h3>
        <p className="text-xs text-slate-400">Thêm các thuộc tính chi tiết giống như Shopee để khách hàng dễ dàng tra cứu.</p>
        
        <div className="flex flex-wrap gap-2">
           {presets.map(p => (
             <button 
               key={p} 
               onClick={() => addSpec(p)}
               disabled={!!flatSpecs[p]}
               className={`px-4 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${flatSpecs[p] ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-100 text-slate-400 hover:border-black hover:text-black'}`}
             >
               <Plus size={10} /> {p}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {Object.entries(flatSpecs).map(([key, value], idx) => (
            <motion.div 
              key={key}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-4 bg-slate-50/50 p-2 rounded-xl group border border-transparent hover:border-slate-200 hover:bg-white transition-all"
            >
               <div className="w-1/3">
                  <input 
                    className="w-full bg-transparent px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest outline-none border-b border-transparent focus:border-slate-300 focus:text-slate-900 transition-all"
                    defaultValue={key}
                    onBlur={(e) => renameKey(key, e.target.value)}
                    placeholder="Tên thuộc tính..."
                  />
               </div>
               <div className="flex-1">
                  <input 
                    className="w-full bg-transparent px-4 py-3 text-[13px] font-semibold text-slate-900 outline-none border-b border-transparent focus:border-blue-500 transition-all"
                    value={value}
                    onChange={(e) => updateSpec(key, e.target.value)}
                    placeholder="Giá trị..."
                  />
               </div>
               <button 
                 onClick={() => removeSpec(key)}
                 className="p-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
               >
                 <Trash2 size={16} />
               </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <button 
          onClick={() => addSpec()}
          className="w-full py-6 mt-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] hover:border-black hover:text-black transition-all flex items-center justify-center gap-3"
        >
          <Plus size={16} /> Thêm thuộc tính mới
        </button>
      </div>
    </div>
  );
};

export default SpecsEditor;
