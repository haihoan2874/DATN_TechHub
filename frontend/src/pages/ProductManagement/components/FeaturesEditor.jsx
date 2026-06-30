import React, { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { resolveApiAssetUrl } from '../../../config/api';

// Module configuration cho ReactQuill (Phải để ngoài component để tránh re-render)
const modules = {
  toolbar: [
    [{ 'header': [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
};

const FeaturesEditor = ({ features, setFeatures }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [lastSavedFeatures, setLastSavedFeatures] = useState('');

  useEffect(() => {
    const featuresStr = JSON.stringify(features);
    if (featuresStr === lastSavedFeatures) return; // Ignore if we caused this update

    const parsed = Array.isArray(features) ? features : [];
    
    // Check if we already have a rich_text block
    const richTextBlock = parsed.find(b => b?.type === 'rich_text');
    if (richTextBlock) {
      setHtmlContent(richTextBlock.content || '');
    } else {
      // Convert old block format to HTML if rich_text doesn't exist
      const oldBlocks = parsed.filter(b => b?.type !== 'gallery' && b?.type !== 'rich_text');
      if (oldBlocks.length > 0) {
        let generatedHtml = '';
        oldBlocks.forEach(block => {
          if (block.title) generatedHtml += `<h2>${block.title}</h2>\n`;
          if (block.description) generatedHtml += `<p>${block.description}</p>\n`;
          if (block.image) generatedHtml += `<img src="${resolveApiAssetUrl(block.image)}" alt="${block.title || 'Hình ảnh'}" />\n`;
        });
        setHtmlContent(generatedHtml);
      } else {
        setHtmlContent(''); // Ensure it clears out if loading an empty product
      }
    }
    setLastSavedFeatures(featuresStr);
  }, [features]);

  const notifyChange = useCallback((newHtml, currentFeatures = features) => {
    const parsed = Array.isArray(currentFeatures) ? currentFeatures : [];
    const galleryBlock = parsed.find(b => b?.type === 'gallery');
    
    const newFeatures = [
      { type: 'rich_text', content: newHtml }
    ];
    
    if (galleryBlock) {
      newFeatures.push(galleryBlock);
    }
    
    setLastSavedFeatures(JSON.stringify(newFeatures));
    setFeatures(newFeatures);
  }, [features, setFeatures]);

  const handleChange = (content) => {
    setHtmlContent(content);
    notifyChange(content);
  };

  // Xác định chính xác khi nào trình soạn thảo bị trống (kể cả khi thư viện bị lỗi state)
  const isEffectivelyEmpty = !htmlContent || htmlContent === '<p><br></p>';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`quill-editor-container ${!isEffectivelyEmpty ? 'hide-placeholder' : ''}`}>
        <style dangerouslySetInnerHTML={{__html: `
          .quill-editor-container.hide-placeholder .ql-editor::before {
            display: none !important;
          }
          .quill-editor-container .ql-container {
            font-family: inherit;
            font-size: 14px;
            min-height: 400px;
            border-bottom-left-radius: 0.75rem;
            border-bottom-right-radius: 0.75rem;
            border-color: #e2e8f0;
          }
          .quill-editor-container .ql-toolbar {
            border-top-left-radius: 0.75rem;
            border-top-right-radius: 0.75rem;
            border-color: #e2e8f0;
            background-color: #f8fafc;
          }
          .quill-editor-container .ql-editor {
             min-height: 400px;
          }
          .quill-editor-container .ql-editor h2 {
            font-size: 1.5em;
            font-weight: 700;
            margin-bottom: 0.5em;
            color: #0f172a;
          }
          .quill-editor-container .ql-editor h3 {
            font-size: 1.17em;
            font-weight: 600;
            margin-bottom: 0.5em;
            color: #1e293b;
          }
          .quill-editor-container .ql-editor p {
            margin-bottom: 1em;
            line-height: 1.6;
            color: #334155;
          }
          .quill-editor-container .ql-editor img {
            max-width: 100%;
            border-radius: 0.5rem;
            margin: 1em 0;
            border: 1px solid #e2e8f0;
          }
        `}} />
        <ReactQuill 
          theme="snow" 
          value={htmlContent} 
          onChange={handleChange} 
          modules={modules}
          placeholder="Soạn thảo mô tả chi tiết sản phẩm. Có thể bôi đen để in đậm, chọn H2 cho tiêu đề chính, và chèn ảnh..."
        />
      </div>
    </div>
  );
};

export default FeaturesEditor;
