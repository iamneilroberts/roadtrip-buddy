import React, { useEffect, useState } from 'react';
import { getAvailablePrompts, getSelectedPromptId, setSelectedPromptId, SystemPrompt } from '../../utils/promptManager';
import { useChat } from '../../hooks/useChat';

interface PromptSelectorProps {
  onChange?: (promptId: string) => void;
}

const PromptSelector: React.FC<PromptSelectorProps> = ({ onChange }) => {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [selectedPromptId, setSelectedPrompt] = useState<string>('');
  const { clearMessages } = useChat();

  useEffect(() => {
    // Get available prompts
    const availablePrompts = getAvailablePrompts();
    setPrompts(availablePrompts);
    
    // Get the currently selected prompt
    const currentPromptId = getSelectedPromptId();
    console.log('PromptSelector: Current prompt ID from localStorage:', currentPromptId);
    setSelectedPrompt(currentPromptId);
    
    // Notify parent component of initial selection
    if (onChange) {
      onChange(currentPromptId);
    }
  }, [onChange]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPromptId = e.target.value;
    setSelectedPrompt(newPromptId);
    setSelectedPromptId(newPromptId);
    
    // Clear chat messages when prompt changes to avoid context confusion
    clearMessages();
    
    if (onChange) {
      onChange(newPromptId);
    }
  };

  return (
    <div className="prompt-selector flex items-center gap-2 p-2">
      <label htmlFor="prompt-select" className="text-sm font-medium text-gray-700">System Prompt:</label>
      <select 
        id="prompt-select" 
        value={selectedPromptId} 
        onChange={handlePromptChange}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        {prompts.map(prompt => (
          <option key={prompt.id} value={prompt.id}>
            {prompt.name}
          </option>
        ))}
      </select>
      <div className="text-xs text-gray-500 ml-2">
        {selectedPromptId && `Using: ${prompts.find(p => p.id === selectedPromptId)?.name || 'Custom prompt'}`}
      </div>
    </div>
  );
};

export default PromptSelector;
