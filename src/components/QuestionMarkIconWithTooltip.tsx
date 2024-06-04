import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { Callout } from '@fluentui/react/lib/Callout';
import { Link } from '@fluentui/react/lib/Link';

import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ChatHelp20Regular } from '@fluentui/react-icons';
import { API_URLS } from '../common/Config';

interface IQuestionMarkIconWithCalloutProps {
  spfxContext: WebPartContext;
}

interface HelpLink {
  Title: string;
  link: { Url: string };
}

const QuestionMarkIconWithCallout: React.FC<IQuestionMarkIconWithCalloutProps> = ({ spfxContext }) => {
  const [helpLinks, setHelpLinks] = useState<HelpLink[]>([]);
  const [isCalloutVisible, setIsCalloutVisible] = useState(false);
  const iconRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchUrls = async () => {
      const url = `${API_URLS.BASE_URL}/_api/web/lists/getbytitle('Help Links')/items?$select=Title,link`;
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose'
          },
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch help links');
        const result = await response.json();
        setHelpLinks(result.d.results);
      } catch (error) {
        console.error("Error fetching help links:", error);
      }
    };
    fetchUrls();
  }, [spfxContext]);

  const toggleCallout = () => setIsCalloutVisible(!isCalloutVisible);

  const calloutContent = (
    <div style={{ padding: '20px' }}>
      {helpLinks.map((item, index) => (
        <React.Fragment key={item.Title}>
          <Link href={item.link.Url} target="_blank" title={item.Title} style={{ color: '#333', textDecoration: 'none', fontSize: '14px' }}>
            {item.Title}
          </Link>
          {index < helpLinks.length - 1 && <hr />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div>
      <div ref={iconRef} style={{ cursor: 'pointer' }} onClick={toggleCallout}>
        <ChatHelp20Regular title="Help" style={{ height: '30px', width: '30px' }} />
      </div>
      {isCalloutVisible && (
        <Callout
          className="ms-CalloutExample-callout"
          ariaLabelledBy="callout-label-1"
          ariaDescribedBy="callout-description-1"
          role="dialog"
          gapSpace={0}
          target={iconRef.current}
          onDismiss={toggleCallout}
          setInitialFocus
          directionalHint={0}  // This places the callout directly below the target element
        >
          {calloutContent}
        </Callout>
      )}
    </div>
  );
};

export default QuestionMarkIconWithCallout;
