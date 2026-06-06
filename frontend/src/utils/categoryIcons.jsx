import { Activity, Cable, Headphones, ShieldCheck, Smartphone, Tag, Watch } from 'lucide-react';

const ICON_MAP = {
  Activity,
  Cable,
  Headphones,
  ShieldCheck,
  Smartphone,
  Tag,
  Watch,
};

export const getCategoryIconComponent = (category) => {
  const iconName = category?.icon;
  const name = category?.name?.toLowerCase() || '';

  if (name.includes('tai nghe')) return Headphones;
  if (name.includes('sức khỏe') || name.includes('theo dõi')) return Activity;
  if (name.includes('dây') || name.includes('cáp') || name.includes('sạc')) return Cable;
  if (name.includes('kính') || name.includes('bảo vệ')) return ShieldCheck;
  if (name.includes('phụ kiện')) return Tag;
  if (name.includes('đồng hồ') || name.includes('smartwatch')) return Watch;

  return ICON_MAP[iconName] || Tag;
};
