import React from 'react';
const Tabs = ({ 
  tabs = [], 
  activeTab, 
  onChange,
  children,
  className = ''
}) => {
  return (
    <div className={`tabs-container ${className}`}>
      {tabs.length > 0 ? (
        <div className="inline-flex w-full flex-wrap gap-2 rounded-2xl border border-black/8 bg-white p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`relative z-10 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-background-cream text-primary-black' : 'text-secondary-brown/65 hover:text-primary-black'
              }`}
              onClick={() => (onChange ? onChange(tab.id) : null)}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      ) : children}
    </div>
  );
};

export const TabList = ({ children, className = '' }) => (
  <div className={`inline-flex w-full flex-wrap gap-2 rounded-2xl border border-black/8 bg-white p-2 ${className}`}>
    {children}
  </div>
);

export const TabTrigger = ({ value, children, activeTab, onChange, className = '' }) => (
  <button
    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
      activeTab === value ? 'bg-background-cream text-primary-black' : 'text-secondary-brown/65 hover:text-primary-black'
    } ${className}`}
    onClick={() => onChange && onChange(value)}
  >
    {children}
  </button>
);

export const TabContent = ({ value, activeTab, children, className = '' }) => {
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};

export default Tabs;
