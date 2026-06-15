import React, { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';

const SpecsEditor = ({ specs, setSpecs }) => {
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

  const addSpec = () => {
    setSpecs({ ...flatSpecs, [`Thông số ${Object.keys(flatSpecs).length + 1}`]: "" });
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
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        {Object.entries(flatSpecs).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
             <input 
               className="form-input w-1/3"
               defaultValue={key}
               onBlur={(e) => renameKey(key, e.target.value)}
               placeholder="Tên thông số"
             />
             <input 
               className="form-input flex-1"
               value={value}
               onChange={(e) => updateSpec(key, e.target.value)}
               placeholder="Giá trị"
             />
             <button 
               type="button"
               onClick={() => removeSpec(key)}
               aria-label="Xóa"
               className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
             >
               <Trash2 size={18} />
             </button>
          </div>
        ))}
      </div>

      <button 
        type="button"
        onClick={addSpec}
        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
      >
        <Plus size={16} /> Thêm thông số
      </button>
    </div>
  );
};

export default SpecsEditor;
