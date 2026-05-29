import React, { useState, useRef } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { resolveApiAssetUrl } from '../../config/api';

const ImageUpload = ({ value, onChange, label, folder = 'products' }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh');
      return;
    }

    // Validate size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB');
      return;
    }

    setUploading(true);
    try {
      const response = await adminService.uploadFile(file, folder);
      // Backend returns { url: "/api/v1/files/..." }
      // We need to prepend the base URL if needed, but our axios is configured.
      // Assuming backend returns a usable relative path.
      const imageUrl = response.url;
        
      onChange(imageUrl);
      toast.success('Tải ảnh thành công');
    } catch (err) {
      toast.error('Lỗi khi tải ảnh lên');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getImageUrl = (url) => {
    return resolveApiAssetUrl(url, '');
  };

  return (
    <div className="space-y-2">
      {label && <label className="form-label-strong">{label}</label>}
      
      <div className="relative group">
        {value ? (
          <div className="group relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 lg:aspect-[21/9]">
            <img src={getImageUrl(value)} alt="Preview" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white rounded-xl text-black hover:bg-blue-600 hover:text-white transition-all shadow-xl"
              >
                <Upload size={20} />
              </button>
              <button 
                type="button"
                onClick={removeImage}
                className="p-3 bg-white rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-blue-500 hover:bg-blue-50 lg:aspect-[21/9]"
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 shadow-sm transition-colors">
              {uploading ? <Loader2 size={32} className="animate-spin" /> : <ImageIcon size={32} />}
            </div>
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-900">Tải ảnh lên</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1">Hỗ trợ JPG, PNG, WEBP (Max 5MB)</p>
            </div>
          </button>
        )}
        
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
      </div>

      {/* Direct link input as fallback */}
      <div className="relative">
         <input 
           type="text"
           value={value}
           onChange={(e) => onChange(e.target.value)}
           placeholder="Hoặc dán URL hình ảnh tại đây..."
           className="form-input pr-10 font-mono text-xs"
         />
         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
           <ImageIcon size={14} />
         </div>
      </div>
    </div>
  );
};

export default ImageUpload;
