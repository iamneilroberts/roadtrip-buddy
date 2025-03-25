import { useContext } from 'react';
import ChatContext from '../context/ChatContext';

/**
 * Custom hook to access the chat context
 * @returns The chat context state and functions
 */
export const useChat = () => {
  return useContext(ChatContext);
};

export default useChat;
