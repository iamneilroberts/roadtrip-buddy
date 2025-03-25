import React from 'react';
import { useDebug } from '../../context/DebugContext';

const DebugButton: React.FC = () => {
  const { toggleDebugPanel, logs } = useDebug();

  return (
    <button
      onClick={toggleDebugPanel}
      className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center z-50"
      title="Toggle Debug Panel"
    >
      <span className="mr-2">🐞</span>
      <span>Debug</span>
      {logs.length > 0 && (
        <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {logs.length}
        </span>
      )}
    </button>
  );
};

export default DebugButton;
