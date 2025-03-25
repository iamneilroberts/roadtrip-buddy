import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../../hooks/useChat';

const RecommendationDisplay: React.FC = () => {
  const { lastResponse } = useChat();

  if (!lastResponse) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <div className="prose max-w-none">
        <ReactMarkdown>{lastResponse.markdown}</ReactMarkdown>
      </div>
      
      {lastResponse.json && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <details>
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              View JSON Data
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded-md overflow-x-auto text-xs">
              {JSON.stringify(lastResponse.json, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default RecommendationDisplay;
