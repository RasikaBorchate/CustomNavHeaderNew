import * as React from 'react';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { Bot20Regular } from '@fluentui/react-icons';

interface ChatbotIconWithTooltipProps {
    onClick: () => void;
}

const ChatbotIconWithTooltip: React.FC<ChatbotIconWithTooltipProps> = ({ onClick }) => {

  
    return (
        <TooltipHost content="Chat with our bot" id="chatbotTooltip" calloutProps={{ gapSpace: 0 }}>
            <Bot20Regular title='Chatbot' style={{ height: '30px', width: '30px', cursor: 'pointer' }} onClick={onClick} />
        </TooltipHost>
    );
};

export default ChatbotIconWithTooltip;
