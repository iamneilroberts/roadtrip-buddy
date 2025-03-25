import React, { useState, useEffect } from 'react';

// Define the log entry type
export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'request' | 'response' | 'error' | 'parsed';
  data: any;
}

// Props for the DebugPanel component
interface DebugPanelProps {
  logs: LogEntry[];
  isOpen: boolean;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ logs, isOpen, onClose }) => {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'raw' | 'formatted' | 'conversation'>('raw');
  const [filter, setFilter] = useState<'all' | 'request' | 'response' | 'error' | 'parsed'>('all');
  
  // Auto-select the most recent log when logs change
  useEffect(() => {
    if (logs.length > 0) {
      setSelectedLog(logs[logs.length - 1]);
    }
  }, [logs]);

  if (!isOpen) return null;

  // Filter logs based on selected filter
  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);

  // Extract conversation history from logs
  const conversationHistory = logs
    .filter(log => log.type === 'request' || log.type === 'parsed')
    .map(log => {
      if (log.type === 'request') {
        return {
          role: 'user',
          content: log.data.prompt || 'Unknown message',
          timestamp: log.timestamp
        };
      } else {
        return {
          role: 'assistant',
          content: log.data?.markdown || 'Unknown response',
          json: log.data?.json,
          timestamp: log.timestamp
        };
      }
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Format JSON data for better display
  const formatJsonData = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return 'Error formatting JSON data';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white h-1/2 flex flex-col shadow-lg z-50">
      <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold mr-4">API Debug Console</h2>
          <div className="flex space-x-2">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-gray-700 text-white text-sm rounded px-2 py-1"
            >
              <option value="all">All Logs</option>
              <option value="request">Requests</option>
              <option value="response">Responses</option>
              <option value="parsed">Parsed Data</option>
              <option value="error">Errors</option>
            </select>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded"
        >
          ✕
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Log list sidebar */}
        <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-4 text-gray-400">No logs yet</div>
          ) : (
            <ul>
              {filteredLogs.map((log) => (
                <li 
                  key={log.id}
                  className={`p-2 cursor-pointer hover:bg-gray-800 border-b border-gray-700 ${
                    selectedLog?.id === log.id ? 'bg-gray-800' : ''
                  }`}
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      log.type === 'request' ? 'bg-blue-600' : 
                      log.type === 'response' ? 'bg-green-600' : 
                      log.type === 'parsed' ? 'bg-purple-600' : 'bg-red-600'
                    }`}>
                      {log.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-1 text-sm truncate">
                    {log.type === 'request' ? log.data.prompt : 
                     log.type === 'parsed' ? 'Parsed Response' : 
                     log.type === 'response' ? 'API Response' : 'Error'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Log details panel */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button 
              className={`px-4 py-2 ${activeTab === 'raw' ? 'bg-gray-800 border-b-2 border-blue-500' : 'hover:bg-gray-800'}`}
              onClick={() => setActiveTab('raw')}
            >
              Raw Data
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === 'formatted' ? 'bg-gray-800 border-b-2 border-blue-500' : 'hover:bg-gray-800'}`}
              onClick={() => setActiveTab('formatted')}
            >
              Formatted
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === 'conversation' ? 'bg-gray-800 border-b-2 border-blue-500' : 'hover:bg-gray-800'}`}
              onClick={() => setActiveTab('conversation')}
            >
              Conversation
            </button>
          </div>
          
          {/* Content based on active tab */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'raw' && selectedLog && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {selectedLog.type === 'request' ? 'Request' : 
                     selectedLog.type === 'response' ? 'Response' : 
                     selectedLog.type === 'parsed' ? 'Parsed Data' : 'Error'}
                  </h3>
                  <div className="text-sm text-gray-400">
                    {selectedLog.timestamp.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded overflow-x-auto">
                  <pre className="text-sm">
                    {formatJsonData(selectedLog.data)}
                  </pre>
                </div>
              </div>
            )}
            
            {activeTab === 'formatted' && selectedLog && (
              <div>
                {selectedLog.type === 'parsed' && selectedLog.data.markdown && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Markdown Content</h3>
                    <div className="bg-gray-800 p-4 rounded overflow-x-auto">
                      <pre className="text-sm whitespace-pre-wrap">{selectedLog.data.markdown}</pre>
                    </div>
                  </div>
                )}
                
                {selectedLog.type === 'parsed' && selectedLog.data.json && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">JSON Data</h3>
                    <div className="bg-gray-800 p-4 rounded overflow-x-auto">
                      <pre className="text-sm">{formatJsonData(selectedLog.data.json)}</pre>
                    </div>
                  </div>
                )}
                
                {selectedLog.type === 'request' && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">User Message</h3>
                    <div className="bg-gray-800 p-4 rounded overflow-x-auto">
                      <p className="text-sm whitespace-pre-wrap">{selectedLog.data.prompt}</p>
                    </div>
                    
                    {selectedLog.data.systemMessage && (
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">System Message</h3>
                        <div className="bg-gray-800 p-4 rounded overflow-x-auto">
                          <pre className="text-sm whitespace-pre-wrap">{selectedLog.data.systemMessage}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'conversation' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Conversation History</h3>
                {conversationHistory.length === 0 ? (
                  <div className="text-gray-400">No conversation history yet</div>
                ) : (
                  <div className="space-y-4">
                    {conversationHistory.map((message, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded ${
                          message.role === 'user' ? 'bg-blue-900' : 'bg-gray-800'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">
                            {message.role === 'user' ? 'User' : 'Assistant'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                        {message.role === 'assistant' && message.json && (
                          <div className="mt-2">
                            <button 
                              onClick={() => {
                                const jsonData = message.json;
                                const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `response_${new Date(message.timestamp).toISOString()}.json`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              }}
                              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                            >
                              Download JSON
                            </button>
                            <button 
                              onClick={() => {
                                const jsonString = JSON.stringify(message.json, null, 2);
                                navigator.clipboard.writeText(jsonString)
                                  .then(() => alert('JSON copied to clipboard'))
                                  .catch(err => console.error('Failed to copy:', err));
                              }}
                              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded ml-2"
                            >
                              Copy JSON
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {!selectedLog && activeTab !== 'conversation' && (
              <div className="text-gray-400">Select a log to view details</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
