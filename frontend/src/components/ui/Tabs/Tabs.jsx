import React, { useState, useEffect, useRef } from 'react';
import './Tabs.css';

/**
 * Tabs Component
 * 
 * Features: gold underline, animated indicator, smooth transitions
 */
const Tabs = ({ 
  tabs = [], 
  activeTab, 
  onChange,
  children,
  className = ''
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabsRef = useRef([]);

  useEffect(() => {
    if (tabs.length > 0) {
      const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
      if (activeIndex !== -1 && tabsRef.current[activeIndex]) {
        const element = tabsRef.current[activeIndex];
        setIndicatorStyle({
          width: element.offsetWidth,
          left: element.offsetLeft
        });
      }
    }
  }, [activeTab, tabs]);

  return (
    <div className={`tabs-container ${className}`}>
      {tabs.length > 0 ? (
        <div className="tabs-list">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={el => tabsRef.current[index] = el}
              className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onChange(tab.id)}
            >
              {tab.icon && <span className="tab-icon">{tab.icon}</span>}
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
          <div className="tabs-indicator" style={indicatorStyle}></div>
        </div>
      ) : children}
    </div>
  );
};

export const TabList = ({ children, className = '' }) => (
  <div className={`tabs-list ${className}`}>
    {children}
  </div>
);

export const TabTrigger = ({ value, children, activeTab, onChange, className = '' }) => (
  <button
    className={`tab-item ${activeTab === value ? 'active' : ''} ${className}`}
    onClick={() => onChange && onChange(value)}
  >
    {children}
  </button>
);

export const TabContent = ({ value, activeTab, children, className = '' }) => {
  if (activeTab !== value) return null;
  return <div className={`tab-content animate-fade-in ${className}`}>{children}</div>;
};

export default Tabs;
