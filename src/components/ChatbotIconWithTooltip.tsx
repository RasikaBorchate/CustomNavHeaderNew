import * as React from 'react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Bot20Regular } from '@fluentui/react-icons';
const ChatbotIconWithTooltip = () => {
  return (
    <TooltipHost content="Chat with our bot" id="chatbotTooltip" calloutProps={{ gapSpace: 0 }}>
    
      <Bot20Regular title='Chatbot' style={{height:'30px', width:'30px', cursor:'pointer'}} />
          
    </TooltipHost>
  );
};

export default ChatbotIconWithTooltip;
