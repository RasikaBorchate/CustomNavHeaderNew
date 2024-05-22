import * as React from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import styles from './MenuLink.module.scss';
import { Link as LinkModel } from '../model/Link';

export interface IMenuLinkProps {
    item: LinkModel;
    mobileMode: boolean;
}

export interface IMenuLinkState {}

export class MenuLink extends React.Component<IMenuLinkProps, IMenuLinkState> {
    constructor(props: IMenuLinkProps) {
        super(props);
    }

    public render(): React.ReactElement<IMenuLinkProps> {
        const { item, mobileMode } = this.props;

        return (
            <Link 
                className={`${styles.link} ${!mobileMode ? "ms-fontColor-neutralPrimary" : "ms-fontColor-neutralSecondary"} ms-fontSize-m`}
                href={item.url}
                target={item.openInNewTab ? "_blank" : ""}
                data-interception={item.openInNewTab ? "off" : "on"}
                style={{ cursor: item.url ? 'pointer' : 'default' }} // Conditionally apply cursor style
            >
                {item.text}
            </Link>
        );
    }
}
