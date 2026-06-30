import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../../services/adminService';
import { resolveApiAssetUrl } from '../../../config/api';

const ProductGalleryEditor = ({ images = [], onChange }) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const invalidFile = files.find((file) => !file.type.startsWith('image/') || file.size > 50 * 1024 * 1024);
    if (invalidFile) {
      toast.error('Mỗi ảnh phải là JPG, PNG hoặc WEBP và không quá 50MB');
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const response = await adminService.uploadFile(file, 'gallery');
        if (response?.url) uploaded.push(response.url);
      }

      if (uploaded.length > 0) {
        onChange([...images, ...uploaded]);
        toast.success(`Đã thêm ${uploaded.length} ảnh vào album`);
      }
    } catch (error) {
      toast.error('Không thể tải album ảnh lên');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeImage = (index) => {
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="form-label-strong">Album ảnh sản phẩm</p>
          <p className="mt-1 text-xs text-slate-500">Dùng cho gallery ảnh ở trang chi tiết. Ảnh chính vẫn nằm ở mục bên trên.</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          Chọn nhiều ảnh
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />

      <div className="relative mb-2">
         <input 
           type="text"
           placeholder="Hoặc dán URL hình ảnh vào đây và nhấn Enter..."
           className="form-input pr-10 font-mono text-xs w-full border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 transition-all bg-white"
           onKeyDown={(e) => {
             if (e.key === 'Enter') {
               e.preventDefault();
               const val = e.target.value.trim();
               if (val) {
                 onChange([...images, val]);
                 e.target.value = '';
               }
             }
           }}
         />
         <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
           <ImagePlus size={16} />
         </div>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <img
                src={resolveApiAssetUrl(image)}
                alt={`Ảnh sản phẩm ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label={`Xóa ảnh sản phẩm ${index + 1}`}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-rose-600 opacity-0 shadow-sm transition-opacity hover:bg-rose-600 hover:text-white group-hover:opacity-100"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
        >
          <ImagePlus size={28} />
          <span className="text-xs font-bold uppercase tracking-widest">Chưa có ảnh album</span>
        </button>
      )}
    </div>
  );
};

export default ProductGalleryEditor;
