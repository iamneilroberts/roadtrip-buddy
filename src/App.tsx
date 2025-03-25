import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LocationProvider } from './context/LocationContext'
import { ChatProvider } from './context/ChatContext'
import { DebugProvider } from './context/DebugContext'
import ChatPage from './pages/ChatPage'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineNotification from './components/OfflineNotification'
import DebugButton from './components/Debug/DebugButton'
import DebugPanel from './components/Debug/DebugPanel'
import { useDebug } from './context/DebugContext'
import './App.css'

// Wrapper component to use hooks
const AppContent = () => {
  const { logs, isDebugPanelOpen, toggleDebugPanel } = useDebug();
  const apiKey = localStorage.getItem('openai_api_key') || '';
  
  return (
    <Router>
      <LocationProvider>
        <ChatProvider apiKey={apiKey}>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
          <OfflineNotification />
          <DebugButton />
          <DebugPanel 
            logs={logs} 
            isOpen={isDebugPanelOpen} 
            onClose={toggleDebugPanel} 
          />
        </ChatProvider>
      </LocationProvider>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <DebugProvider>
        <AppContent />
      </DebugProvider>
    </ErrorBoundary>
  )
}

export default App
