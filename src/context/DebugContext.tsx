import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LogEntry } from '../components/Debug/DebugPanel';

// Define the context state type
interface DebugContextState {
  logs: LogEntry[];
  isDebugPanelOpen: boolean;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  toggleDebugPanel: () => void;
}

// Create the context with default values
const DebugContext = createContext<DebugContextState>({
  logs: [],
  isDebugPanelOpen: false,
  addLog: () => {},
  clearLogs: () => {},
  toggleDebugPanel: () => {},
});

// Props for the DebugProvider component
interface DebugProviderProps {
  children: ReactNode;
}

// Helper to generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// DebugProvider component to wrap the app with debug context
export const DebugProvider: React.FC<DebugProviderProps> = ({ children }) => {
  // State for debug data
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState<boolean>(false);

  // Function to add a log entry
  const addLog = (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...log,
      id: generateId(),
      timestamp: new Date(),
    };
    
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };

  // Function to clear all logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Function to toggle the debug panel
  const toggleDebugPanel = () => {
    setIsDebugPanelOpen((prev) => !prev);
  };

  // Provide the context value
  const contextValue: DebugContextState = {
    logs,
    isDebugPanelOpen,
    addLog,
    clearLogs,
    toggleDebugPanel,
  };

  return (
    <DebugContext.Provider value={contextValue}>
      {children}
    </DebugContext.Provider>
  );
};

// Custom hook to use the debug context
export const useDebug = () => useContext(DebugContext);

export default DebugContext;
