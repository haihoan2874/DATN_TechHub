import React, { useMemo } from 'react';

const ProductSpecs = ({ specs }) => {
  const specGroups = useMemo(() => {
    let parsed = {};
    try {
      parsed = typeof specs === 'string' ? JSON.parse(specs) : specs || {};
    } catch (e) {
      parsed = {};
    }

    const isGrouped = Object.values(parsed).some(isPlainObject);

    if (!isGrouped) {
      return [{
        title: 'Thông số kỹ thuật',
        items: filterDisplaySpecs(parsed)
      }].filter((group) => Object.keys(group.items).length);
    }

    return Object.entries(parsed)
      .map(([groupName, groupValue]) => {
        if (isPlainObject(groupValue)) {
          return {
            title: groupName,
            items: filterDisplaySpecs(groupValue)
          };
        }

        return {
          title: 'Thông số kỹ thuật',
          items: filterDisplaySpecs({ [groupName]: groupValue })
        };
      })
      .filter((group) => Object.keys(group.items).length);
  }, [specs]);

  if (!specGroups.length) return null;

  return (
    <section id="product-specs" className="scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-950 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-blue-500" />
          <div>
            <h2 className="text-lg font-bold">Thông số kỹ thuật</h2>
            <p className="mt-1 text-xs font-medium text-slate-300">Các thông tin chính để đối chiếu khi chọn mua</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {specGroups.map((group) => (
            <div key={group.title} className="overflow-hidden rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <h3 className="text-xs font-black uppercase tracking-[0.12em] text-blue-700">
                  {group.title}
                </h3>
              </div>

              {Object.entries(group.items).map(([key, value], i) => (
                <div key={`${group.title}-${key}`} className="grid border-b border-slate-100 text-sm leading-relaxed last:border-b-0 md:grid-cols-[220px_1fr]">
                  <span className="bg-slate-50/80 px-4 py-3 font-bold text-slate-600">{key}</span>
                  <span className="min-w-0 px-4 py-3 font-semibold text-slate-950">
                    <SpecValue value={value} label={key} />
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SpecValue = ({ value, label }) => {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-1 pl-5 font-medium text-slate-700">
        {value.filter(Boolean).map((item, index) => (
          <li key={`${label}-${index}`}>{String(item)}</li>
        ))}
      </ul>
    );
  }

  if (isPlainObject(value)) {
    return (
      <div className="space-y-1">
        {Object.entries(value).map(([key, nestedValue]) => (
          <p key={key} className="font-medium text-slate-700">
            <span className="font-bold text-slate-900">{key}: </span>
            {String(nestedValue)}
          </p>
        ))}
      </div>
    );
  }

  if (typeof value === 'string' && value.startsWith('http')) {
    return <img src={value} alt={label} className="max-w-[100px] rounded-lg border" />;
  }

  const text = String(value);
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (lines.length > 1) {
    return (
      <div className="space-y-1 font-medium text-slate-700">
        {lines.map((line, index) => (
          <p key={`${label}-${index}`}>{line}</p>
        ))}
      </div>
    );
  }

  return <span>{text}</span>;
};

const isPlainObject = (value) => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const HIDDEN_SPEC_KEYWORDS = [
  'nguồn',
  'source',
  'url',
  'link',
  'image',
  'ảnh',
  'thumbnail'
];

const filterDisplaySpecs = (specs) => Object.fromEntries(
  Object.entries(specs || {}).filter(([key, value]) => {
    const normalizedKey = String(key).toLowerCase();
    if (HIDDEN_SPEC_KEYWORDS.some((keyword) => normalizedKey.includes(keyword))) {
      return false;
    }

    if (value === null || value === undefined || value === '') {
      return false;
    }

    return true;
  })
);

export default ProductSpecs;
