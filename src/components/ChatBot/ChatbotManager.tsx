import * as React from 'react';
import ChatbotIconWithTooltip from '../ChatbotIconWithTooltip';
import ChatBot from './ChatBot';

const ChatbotManager: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    // Corrected toggleChat function
    const toggleChat = () => {
        setIsOpen(!isOpen); // Correctly toggles the state of isOpen
    };

    return (
        <>
            <ChatbotIconWithTooltip onClick={toggleChat} />
            <ChatBot isOpen={isOpen} onToggleChat={toggleChat} />
        </>
    );
};

export default ChatbotManager;
