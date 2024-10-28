import React, { useState, useEffect, useRef } from 'react';

interface ButtonPosition {
  x: number;
  y: number;
  button: HTMLElement;
}

export default function Extension() {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition | null>(null);
  const [site, setSite] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const togglePopup = (event: CustomEvent) => {
      const newButtonPosition = event.detail as ButtonPosition;
      
      if (buttonPosition && buttonPosition.button === newButtonPosition.button) {
        // If clicking the same button, toggle the popup
        setIsOpen(!isOpen);
      } else {
        // If clicking a different button, open the popup
        setIsOpen(true);
        setButtonPosition(newButtonPosition);
      }
    };

    const handleSiteChange = (event: CustomEvent) => {
      setSite(event.detail as string);
    };

    const updatePopupPosition = () => {
      if (isOpen && buttonPosition) {
        const rect = buttonPosition.button.getBoundingClientRect();
        setButtonPosition(prevState => ({
          ...prevState!,
          x: rect.left,
          y: rect.top
        }));
      }
    };

    document.addEventListener('toggleSocialScribePopup', togglePopup as EventListener);
    document.addEventListener('siteChanged', handleSiteChange as EventListener);
    window.addEventListener('scroll', updatePopupPosition);
    window.addEventListener('resize', updatePopupPosition);

    return () => {
      document.removeEventListener('toggleSocialScribePopup', togglePopup as EventListener);
      document.removeEventListener('siteChanged', handleSiteChange as EventListener);
      window.removeEventListener('scroll', updatePopupPosition);
      window.removeEventListener('resize', updatePopupPosition);
    };
  }, [isOpen, buttonPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) && 
          buttonPosition && !buttonPosition.button.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [buttonPosition]);

  if (!isOpen || !buttonPosition) return null;

  return (
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        top: `${buttonPosition.y}px`,
        left: `${buttonPosition.x}px`,
        width: '300px',
        backgroundColor: '#15202B',
        borderRadius: '8px',
        padding: '16px',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        zIndex: 2147483647,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        {['Automatic', 'Controlled', 'Vocal'].map((tab) => (
          <button
            key={tab}
            style={{
              padding: '8px 12px',
              backgroundColor: '#192734',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>Reply type</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['answer', 'disagree', 'joke', 'agree', 'dunk', 'optimistic', 'smart'].map((type) => (
            <button
              key={type}
              style={{
                padding: '4px 8px',
                backgroundColor: '#22303C',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>Reply to</h3>
        <a href="#" style={{ color: '#1DA1F2', textDecoration: 'none' }}>View Post</a>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>Templated messages</h3>
        <select style={{ width: '100%', padding: '8px', backgroundColor: '#22303C', color: 'white', border: 'none', borderRadius: '4px' }}>
          <option>Select Template</option>
        </select>
      </div>
      <button
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: '#1DA1F2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Generate Response
      </button>
    </div>
  );
}