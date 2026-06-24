import React, { useMemo, useState, useRef, useEffect } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { resolveApiAssetUrl } from '../../../config/api';

const ProductFeatures = ({ features, description }) => {
  const contentRef = useRef(null);
  const [isLongContent, setIsLongContent] = useState(false);
  const [showMoreFeatures, setShowMoreFeatures] = useState(false);

  useEffect(() => {
    // A small delay to ensure images or inner HTML are rendered
    const checkHeight = () => {
      if (contentRef.current) {
        if (contentRef.current.scrollHeight > 600) {
          setIsLongContent(true);
        } else {
          setIsLongContent(false);
        }
      }
    };
    
    checkHeight();
    const timer = setTimeout(checkHeight, 500);
    return () => clearTimeout(timer);
  }, [features, description]);
  const { textFeatures, contentBlocks } = useMemo(() => {
    try {
      const parsed = typeof features === 'string' ? JSON.parse(features) : (features || []);
      if (!Array.isArray(parsed)) return { textFeatures: [], contentBlocks: [] };

      return parsed.reduce((acc, block) => {
        if (!block) return acc;
        if (typeof block === 'string') {
          acc.textFeatures.push(block);
          return acc;
        }
        if (block.type === 'gallery') return acc;
        acc.contentBlocks.push(block);
        return acc;
      }, { textFeatures: [], contentBlocks: [] });
    } catch (e) {
      return { textFeatures: [], contentBlocks: [] };
    }
  }, [features]);

  if (!textFeatures.length && !contentBlocks.length && !description) return null;

  return (
    <section id="product-description" className="scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chi tiết sản phẩm</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">Mô tả, điểm nổi bật và thông tin sử dụng thực tế</p>
          </div>
        </div>
      </div>

      <div 
        ref={contentRef}
        className={`relative ${!isLongContent || showMoreFeatures ? '' : 'max-h-[600px] overflow-hidden'}`}
      >
        <div className="space-y-8 p-5 sm:p-7">
          {description && (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5">
              <div
                className="max-w-none text-sm leading-7 text-slate-700 sm:text-base [&>p]:mb-4 [&>h2]:mb-3 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-950 [&>h3]:mb-3 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-slate-950 [&>img]:my-4 [&>img]:rounded-xl"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          )}

          {textFeatures.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
              <h3 className="text-base font-bold text-slate-950 sm:text-lg">Điểm nổi bật</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {textFeatures.map((feature, index) => (
                  <div key={`${feature}-${index}`} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3">
                    <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-blue-600" />
                    <p className="text-sm font-semibold leading-6 text-slate-800">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contentBlocks.length === 0 && description ? null : contentBlocks.map((block, index) => (
            <div key={index} className="space-y-4">
              {block.title && (
                <h3 className="text-lg font-bold leading-tight text-slate-950">
                  {block.title}
                </h3>
              )}
              
              {block.description && (
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-base">
                  {block.description}
                </p>
              )}

              {block.image && (
                <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  <img 
                    src={resolveApiAssetUrl(block.image)}
                    alt={block.title || 'Chi tiết sản phẩm'}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full object-cover"
                  />
                </div>
              )}

              {block.items && block.items.length > 0 && (
                <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                  {block.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {isLongContent && !showMoreFeatures && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center bg-gradient-to-t from-white via-white/90 to-transparent pt-32 pb-4">
            <button
              onClick={() => setShowMoreFeatures(true)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-blue-600 shadow-lg transition-all hover:bg-blue-50 hover:-translate-y-0.5"
            >
              Xem thêm nội dung <ChevronDown size={18} />
            </button>
          </div>
        )}
      </div>

      {isLongContent && showMoreFeatures && (
        <div className="border-t border-slate-100 p-6 text-center">
          <button
            onClick={() => {
              setShowMoreFeatures(false);
              document.getElementById('product-description').scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:-translate-y-0.5"
          >
            Thu gọn <ChevronUp size={18} />
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductFeatures;
