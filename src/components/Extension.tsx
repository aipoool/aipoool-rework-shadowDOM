import React, { useState, useRef, useEffect } from 'react';

export default function Extension() {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={togglePopup}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#1DA1F2',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}
      >
        +
      </button>
      {isOpen && (
        <div
          ref={popupRef}
          style={{
            position: 'absolute',
            top: '50px',
            left: '0',
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
      )}
    </div>
  );
}