import * as React from 'react';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { Bot20Regular } from '@fluentui/react-icons';

// Define the interface for the component props
interface ChatbotIconWithTooltipProps {
 
}

const ChatbotIconWithTooltip: React.FC<ChatbotIconWithTooltipProps> = ({ }) => {
    const handleClick = () => {
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '400px'; // Adjust height as needed
        iframe.src = `https://bmrn.sharepoint.com/sites/biowebdev1/pages/testchatbot.aspx`;
        iframe.frameBorder = '0';

        // Optionally, check if an iframe already exists and remove it before adding a new one
        const existingIframe = document.body.querySelector('iframe');
        if (existingIframe) existingIframe.remove();  // Corrected typo and logical error

        document.body.appendChild(iframe);
    };

    return (
        <TooltipHost content="Chat with our bot" id="chatbotTooltip" calloutProps={{ gapSpace: 0 }}>
            <Bot20Regular title='Chatbot' style={{ height: '30px', width: '30px', cursor: 'pointer' }} onClick={handleClick} />
        </TooltipHost>
    );
};

export default ChatbotIconWithTooltip;
