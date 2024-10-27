import React, { forwardRef, useState, useEffect } from 'react';
import Tab from './Tab';

interface PopupProps {
  buttonRef: React.RefObject<HTMLButtonElement>;
}

const Popup = forwardRef<HTMLDivElement, PopupProps>(({ buttonRef }, ref) => {
  const [activeTab, setActiveTab] = useState('Automatic');
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, [buttonRef]);

  const tabs = ['Automatic', 'Controlled', 'Vocal'];

  return (
    <div
      ref={ref}
      className="absolute bg-gray-800 rounded-lg shadow-xl p-4 w-80 transition-all duration-300 ease-in-out"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        color: 'white',
        fontSize: '14px',
        lineHeight: '1.5',
      }}
    >
      <div className="flex space-x-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-3 py-2 rounded-md transition-colors duration-200 ${
              activeTab === tab ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab(tab)}
            style={{ border: 'none', cursor: 'pointer' }}
          >
            {tab}
          </button>
        ))}
      </div>
      <Tab activeTab={activeTab} />
    </div>
  );
});

Popup.displayName = 'Popup';

export default Popup;