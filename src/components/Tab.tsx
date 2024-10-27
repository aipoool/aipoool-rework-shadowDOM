import React from 'react';

interface TabProps {
  activeTab: string;
}

const Tab: React.FC<TabProps> = ({ activeTab }) => {
  const replyTypes = [
    { emoji: '💡', text: 'answer' },
    { emoji: '👎', text: 'disagree' },
    { emoji: '😂', text: 'joke' },
    { emoji: '👍', text: 'agree' },
    { emoji: '🏀', text: 'dunk' },
    { emoji: '😊', text: 'optimistic' },
    { emoji: '🧠', text: 'smart' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white mb-2 text-lg">Reply type</h3>
        <div className="flex flex-wrap gap-2">
          {replyTypes.map(({ emoji, text }) => (
            <button
              key={text}
              className="px-3 py-1 bg-gray-700 rounded-full text-sm text-white hover:bg-gray-600 transition-colors duration-200"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              {emoji} {text}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-white mb-2 text-lg">Reply to</h3>
        <a href="#" className="text-blue-400 hover:underline">View Post</a>
      </div>
      <div>
        <h3 className="text-white mb-2 text-lg">Templated messages</h3>
        <div className="flex items-center space-x-2">
          <select className="bg-gray-700 text-white rounded-md px-3 py-2 w-full" style={{ border: 'none' }}>
            <option>Select Template</option>
          </select>
          <button className="p-2 bg-gray-700 rounded-md text-white hover:bg-gray-600 transition-colors duration-200" style={{ border: 'none', cursor: 'pointer' }}>
            +
          </button>
          <button className="p-2 bg-gray-700 rounded-md text-white hover:bg-gray-600 transition-colors duration-200" style={{ border: 'none', cursor: 'pointer' }}>
            ✏️
          </button>
          <button className="p-2 bg-gray-700 rounded-md text-white hover:bg-gray-600 transition-colors duration-200" style={{ border: 'none', cursor: 'pointer' }}>
            🗑️
          </button>
        </div>
      </div>
      <button 
        className="w-full bg-blue-500 text-white rounded-md py-2 hover:bg-blue-600 transition-colors duration-200" 
        style={{ border: 'none', cursor: 'pointer' }}
      >
        Generate Response
      </button>
    </div>
  );
};

export default Tab;