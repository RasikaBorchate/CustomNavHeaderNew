import * as React from 'react';
//import { Link } from 'office-ui-fabric-react/lib/Link';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import styles from './FlyoutColumnHeading.module.scss';
import { Link as LinkModel } from '../model/Link';

export interface IFlyoutColumnHeadingProps {
    item: LinkModel;
    mobileMode: boolean;
    headingTouched: () => void;
    closeFlyout?: () => void;
}

export interface IFlyoutColumnHeadingState {
    isExpanded: boolean;
}

export class FlyoutColumnHeading extends React.Component<IFlyoutColumnHeadingProps, IFlyoutColumnHeadingState> {
    constructor(props: IFlyoutColumnHeadingProps) {
        super(props);
        this.state = {
            isExpanded: false,
        };
    }

    handleToggle = () => {
        if (this.props.item.url && this.props.mobileMode) {
            // If there is a URL and we are in mobile mode, navigate to the URL.
            window.location.href = this.props.item.url;
        } else {
            // Otherwise, toggle the expanded state.
            this.setState(prevState => ({
                isExpanded: !prevState.isExpanded,
            }));
            this.props.headingTouched();
        }
    };
    handleClick = () => {
      
        // Close the flyout if the callback is provided
        if (this.props.closeFlyout) {
            console.log('Closing flyout');
            this.props.closeFlyout();
        }
    
        // Navigation logic
        if (this.props.item.url) {
            console.log('Navigating to URL', this.props.item.url);
            if (this.props.item.openInNewTab) {
                window.open(this.props.item.url, '_blank');
            } else {
                window.location.href = this.props.item.url;
            }
        } else {
            console.log('Toggling expansion');
            this.handleToggle();  // Handles toggling the expanded state if no URL is provided
        }
    };
    public render(): React.ReactElement<IFlyoutColumnHeadingProps> {
        const { isExpanded } = this.state;
        const { item, mobileMode } = this.props;

        if (item.url && !mobileMode) {
            return (
                <div  onClick={this.handleClick}
              
                    className={`${styles.headingLink} ms-fontWeight-semibold ms-fontSize-m-plus`}
                    style={{ cursor: item.url ? 'pointer' : 'default' }}
                    
                   
                >
                    {item.text}
               </div>
            );
        } else {
            return (
                <div
                    className={`${styles.headingNoLink} ms-fontWeight-semibold ms-fontSize-m-plus`}
                    onClick={this.handleToggle} style={{ cursor: item.url ? 'pointer' : 'default' }}
                >
                    {mobileMode && <Icon style={{ fontWeight: 'bold', marginRight: '20px' }} iconName={isExpanded ? "ChevronUp" : "ChevronDown"} />}
                    {item.text}
                </div>
            );
        }
    }
}
