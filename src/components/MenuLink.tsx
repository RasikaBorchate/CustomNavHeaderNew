import * as React from 'react';

import styles from './MenuLink.module.scss';
import { Link as LinkModel } from '../model/Link';

export interface IMenuLinkProps {
    item: LinkModel;
    mobileMode: boolean;
    closeFlyout?: () => void;
}

export interface IMenuLinkState { }

export class MenuLink extends React.Component<IMenuLinkProps, IMenuLinkState> {
    constructor(props: IMenuLinkProps) {
        super(props);
    }
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

        }
    };
    public render(): React.ReactElement<IMenuLinkProps> {
        const { item, mobileMode } = this.props;

        return (
            <div
                className={`${styles.link} ${!mobileMode ? "ms-fontColor-neutralPrimary" : "ms-fontColor-neutralSecondary"} ms-fontSize-m`}
                onClick={this.handleClick}

                style={{ cursor: item.url ? 'pointer' : 'default' }} // Conditionally apply cursor style
            >
                {item.text}
            </div>
        );
    }
}
