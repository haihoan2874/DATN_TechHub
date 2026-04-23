import React from 'react';

export const GradientIcon = ({ children, id, colors, className, size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
        {colors.map((color, i) => (
          <stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={color} />
        ))}
      </linearGradient>
    </defs>
    {children}
  </svg>
);

export const LogoIcon = ({ className, size = 32 }) => (
  <GradientIcon id="logo-grad" colors={['#1e3a8a', '#3b82f6']} size={size} className={className}>
    {/* Stylized S + Pulse Wave */}
    <path 
      d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12" 
      stroke="url(#logo-grad)" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
    <path 
      d="M7 12H9.5L11 8L13 16L14.5 12H17" 
      stroke="url(#logo-grad)" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M8 8C8 8 10 6 12 6C14 6 16 8 16 8M8 16C8 16 10 18 12 18C14 18 16 16 16 16"
      stroke="url(#logo-grad)" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
  </GradientIcon>
);

export const DashboardIcon = ({ className, size = 24 }) => (
  <GradientIcon id="dash-grad" colors={['#3b82f6', '#6366f1']} size={size} className={className}>
    <rect x="3" y="3" width="7" height="7" rx="2" fill="url(#dash-grad)" fillOpacity="0.2" stroke="url(#dash-grad)" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" stroke="url(#dash-grad)" strokeWidth="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" fill="url(#dash-grad)" fillOpacity="0.2" stroke="url(#dash-grad)" strokeWidth="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" stroke="url(#dash-grad)" strokeWidth="2" />
  </GradientIcon>
);

export const ProductIcon = ({ className, size = 24 }) => (
  <GradientIcon id="prod-grad" colors={['#0ea5e9', '#22d3ee']} size={size} className={className}>
    <path d="M21 8L12 3L3 8V16L12 21L21 16V8Z" stroke="url(#prod-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 21V12" stroke="url(#prod-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 12L21 8" stroke="url(#prod-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 12L3 8" stroke="url(#prod-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" fill="url(#prod-grad)" fillOpacity="0.1" stroke="url(#prod-grad)" strokeWidth="2" />
  </GradientIcon>
);

export const CategoryIcon = ({ className, size = 24 }) => (
  <GradientIcon id="cat-grad" colors={['#6366f1', '#a855f7']} size={size} className={className}>
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#cat-grad)" fillOpacity="0.2" stroke="url(#cat-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 17L12 22L22 17" stroke="url(#cat-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 12L12 17L22 12" stroke="url(#cat-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </GradientIcon>
);

export const OrderIcon = ({ className, size = 24 }) => (
  <GradientIcon id="order-grad" colors={['#f59e0b', '#fbbf24']} size={size} className={className}>
    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="url(#order-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6H21" stroke="url(#order-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="url(#order-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </GradientIcon>
);

export const CustomerIcon = ({ className, size = 24 }) => (
  <GradientIcon id="cust-grad" colors={['#10b981', '#34d399']} size={size} className={className}>
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="url(#cust-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="7" r="4" fill="url(#cust-grad)" fillOpacity="0.2" stroke="url(#cust-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2524 22.1614 16.5523C21.6184 15.8522 20.8581 15.3516 20 15.13" stroke="url(#cust-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="url(#cust-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </GradientIcon>
);

export const SettingIcon = ({ className, size = 24 }) => (
  <GradientIcon id="set-grad" colors={['#64748b', '#94a3b8']} size={size} className={className}>
    <circle cx="12" cy="12" r="3" stroke="url(#set-grad)" strokeWidth="2" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="url(#set-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </GradientIcon>
);

export const BellIcon = ({ className, size = 24 }) => (
  <GradientIcon id="bell-grad" colors={['#f43f5e', '#fb7185']} size={size} className={className}>
    <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8" stroke="url(#bell-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="url(#bell-grad)" fillOpacity="0.4" stroke="url(#bell-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </GradientIcon>
);

export const SearchIcon = ({ className, size = 24 }) => (
  <GradientIcon id="search-grad" colors={['#2563eb', '#0ea5e9']} size={size} className={className}>
    <circle cx="11" cy="11" r="8" stroke="url(#search-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21L16.65 16.65" stroke="url(#search-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </GradientIcon>
);
