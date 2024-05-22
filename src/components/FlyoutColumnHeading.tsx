import * as React from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import styles from './FlyoutColumnHeading.module.scss';
import { Link as LinkModel } from '../model/Link';

export interface IFlyoutColumnHeadingProps {
    item: LinkModel;
    mobileMode: boolean;
    headingTouched: () => void;
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

    public render(): React.ReactElement<IFlyoutColumnHeadingProps> {
        const { isExpanded } = this.state;
        const { item, mobileMode } = this.props;

        if (item.url && !mobileMode) {
            return (
                <Link
                    className={`${styles.headingLink} ms-fontWeight-semibold ms-fontSize-m-plus`}
                    href={item.url} style={{ cursor: item.url ? 'pointer' : 'default' }}
                    target={item.openInNewTab ? "_blank" : ""}
                >
                    {item.text}
                </Link>
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
