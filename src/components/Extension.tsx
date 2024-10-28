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
  const [isAnimating, setIsAnimating] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const updatePopupPosition = () => {
    if (buttonPosition) {
      const rect = buttonPosition.button.getBoundingClientRect();
      setButtonPosition(prevState => ({
        ...prevState!,
        x: rect.left,
        y: rect.top
      }));
    }
  };

  useEffect(() => {
    const togglePopup = (event: CustomEvent) => {
      const newButtonPosition = event.detail as ButtonPosition;
      
      if (buttonPosition && buttonPosition.button === newButtonPosition.button) {
        // If clicking the same button, toggle the popup
        setIsOpen(!isOpen);
      } else {
        // If clicking a different button, open the popup
        setIsOpen(true);
      }
      
      // Always update the button position
      const rect = newButtonPosition.button.getBoundingClientRect();
      setButtonPosition({
        x: rect.left,
        y: rect.top,
        button: newButtonPosition.button
      });
    };

    const handleSiteChange = (event: CustomEvent) => {
      setSite(event.detail as string);
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

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300); // Match this with the transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!buttonPosition) return null;

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
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'scale(1)' : 'scale(0.95)',
        transformOrigin: 'top left',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: isOpen || isAnimating ? 'auto' : 'none',
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
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#22303C'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#192734'}
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
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2C3E50'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22303C'}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>Reply to</h3>
        <a href="#" style={{ color: '#1DA1F2', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#0F8FE8'} onMouseLeave={(e) => e.currentTarget.style.color = '#1DA1F2'}>View Post</a>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>Templated messages</h3>
        <select style={{ width: '100%', padding: '8px', backgroundColor: '#22303C', color: 'white', border: 'none', borderRadius: '4px', transition: 'background-color 0.2s ease' }} onChange={(e) => e.currentTarget.style.backgroundColor = '#2C3E50'} onBlur={(e) => e.currentTarget.style.backgroundColor = '#22303C'}>
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
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F8FE8'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1DA1F2'}
      >
        Generate Response
      </button>
    </div>
  );
}