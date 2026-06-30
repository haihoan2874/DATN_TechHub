import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const SpecsEditor = ({ specs, setSpecs }) => {
  const [specItems, setSpecItems] = useState([]);
  const [lastSavedSpecs, setLastSavedSpecs] = useState('');

  // Sync with incoming specs from parent (only when it's an external change, like opening the modal)
  useEffect(() => {
    const specsStr = typeof specs === 'object' ? JSON.stringify(specs) : String(specs);
    if (specsStr === lastSavedSpecs) return; // Ignore updates that we triggered ourselves

    let parsed = {};
    try {
      parsed = typeof specs === 'string' ? JSON.parse(specs) : specs || {};
    } catch (e) {
      parsed = {};
    }
    
    const flattened = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        Object.entries(v).forEach(([subK, subV]) => {
          flattened[`${k} - ${subK}`] = subV;
        });
      } else {
        flattened[k] = v;
      }
    });

    const items = Object.entries(flattened).map(([k, v], index) => ({
      id: `spec-${Date.now()}-${index}`,
      keyName: k,
      value: String(v)
    }));
    
    setSpecItems(items);
    setLastSavedSpecs(specsStr);
  }, [specs]);

  const notifyChange = useCallback((items) => {
    const newSpecsObj = {};
    items.forEach(item => {
      if (item.keyName.trim()) {
        newSpecsObj[item.keyName.trim()] = item.value;
      }
    });
    setLastSavedSpecs(JSON.stringify(newSpecsObj)); // Mark this as our own update
    setSpecs(newSpecsObj);
  }, [setSpecs]);

  const updateItem = (id, field, val) => {
    setSpecItems(prev => {
      const next = prev.map(item => item.id === id ? { ...item, [field]: val } : item);
      notifyChange(next);
      return next;
    });
  };

  const removeItem = (id) => {
    setSpecItems(prev => {
      const next = prev.filter(item => item.id !== id);
      notifyChange(next);
      return next;
    });
  };

  const addItem = () => {
    const newItem = { id: `spec-${Date.now()}`, keyName: '', value: '' };
    setSpecItems(prev => [...prev, newItem]);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-2">
        <div className="flex text-xs font-bold uppercase text-slate-400 px-8">
          <div className="w-1/3">Tên thông số</div>
          <div className="flex-1">Giá trị</div>
        </div>
        
        {specItems.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500 border-2 border-dashed border-slate-100 rounded-xl">
            Chưa có thông số kỹ thuật nào.
          </div>
        ) : (
          specItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3 group">
              <div className="cursor-grab text-slate-300 hover:text-slate-500 mt-3">
                <GripVertical size={16} />
              </div>
              <input 
                className="form-input w-1/3 font-medium bg-slate-50 focus:bg-white transition-colors"
                value={item.keyName}
                onChange={(e) => updateItem(item.id, 'keyName', e.target.value)}
                placeholder="VD: Kích thước màn hình"
              />
              <textarea 
                className="form-input flex-1 bg-slate-50 focus:bg-white transition-colors min-h-[42px] py-2.5 resize-y"
                rows="1"
                value={item.value}
                onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                placeholder="VD: 6.7 inch"
              />
              <button 
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label="Xóa"
                className="mt-1 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      <button 
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <Plus size={16} /> Thêm thông số
      </button>
    </div>
  );
};

export default SpecsEditor;
