import * as React from 'react';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { Bot20Regular } from '@fluentui/react-icons';

// Define the interface for the component props
interface ChatbotIconWithTooltipProps {
    // Currently empty, can be expanded to include future props
}

const ChatbotIconWithTooltip: React.FC<ChatbotIconWithTooltipProps> = ({ }) => {
    const handleClick = () => {
        // Open the chatbot page in a new tab
        const chatbotUrl = `https://bmrn.sharepoint.com/sites/biowebdev1/pages/testchatbot.aspx`;
        window.open(chatbotUrl, '_blank');
    };

    return (
        <TooltipHost content="BioChat" id="chatbotTooltip" calloutProps={{ gapSpace: 0 }}>

            <Bot20Regular title='Chatbot' style={{ height: '30px', width: '30px', cursor: 'pointer' }} onClick={handleClick} />
        </TooltipHost>
    );
};

export default ChatbotIconWithTooltip;