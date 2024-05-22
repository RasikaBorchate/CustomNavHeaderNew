import * as React from 'react';
import { useState, useEffect } from 'react';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import styles from './AlertBar.module.scss';
import { API_URLS } from '../common/Config';
// Define the interface for the component's props
interface IAlertBarProps {
  spfxContext: WebPartContext;
}

const AlertBar: React.FC<IAlertBarProps> = ({ spfxContext }) => {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertId, setAlertId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const fetchAlertMessage = async () => {
      const today = new Date();
      const filter = `StartDate le datetime'${today.toISOString()}' and EndDate ge datetime'${today.toISOString()}'`;
      const url = `${API_URLS.BASE_URL}/_api/web/lists/getbytitle('Alert Messages')/items?$filter=${encodeURIComponent(filter)}&$orderby=EndDate desc&$top=1`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'credentials': 'include'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        const items = result.d.results;
        const dismissedMessageId = localStorage.getItem('dismissedMessageId');

        if (items.length > 0 && (dismissedMessageId === null || items[0].Id.toString() !== dismissedMessageId)) {
          setAlertMessage(items[0].Title);
          setAlertId(items[0].Id);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch (error) {
        console.error("Error fetching alert messages:", error);
        setIsVisible(false);
      }
    };

    fetchAlertMessage();
  }, [spfxContext]);

  const dismissAlert = () => {
    if (alertId) {
      // Dismiss the alert and store the ID of the dismissed message
      localStorage.setItem('dismissedMessageId', alertId.toString());
    }
    setIsVisible(false);
  };

  if (!isVisible || !alertMessage) {
    return null;
  }

  return (
    <MessageBar className={styles.Alertcontainer}
      messageBarType={MessageBarType.warning}
      isMultiline={false}
      onDismiss={dismissAlert}
    >
      <p>{alertMessage}</p>
    </MessageBar>
  );
};

export default AlertBar;
