import * as React from 'react';
import { withResponsiveMode, ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { FlyoutColumnHeading } from './FlyoutColumnHeading';
import { MenuLink } from './MenuLink';
import styles from './FlyoutColumn.module.scss';
import { Link as LinkModel } from '../model/Link';

export interface IFlyoutColumnProps {
    header: LinkModel;
    links: LinkModel[];
    responsiveMode?: ResponsiveMode;
    widthPercent: number;
}

export interface IFlyoutColumnState {
    showLinksWhenMobile: boolean;
    showFlyout:boolean;
}

@withResponsiveMode
export class FlyoutColumn extends React.Component<IFlyoutColumnProps, IFlyoutColumnState> {

    constructor(props:IFlyoutColumnProps) {
        super(props);

        this.handleHeadingTouched = this.handleHeadingTouched.bind(this);

        this.state = {
            showLinksWhenMobile: false,
            showFlyout:false,
        };
    }
    closeFlyout = () => {
        // Assuming 'showFlyout' controls the visibility of the flyout
        this.setState({ showFlyout: false });
    };
    public render(): React.ReactElement<IFlyoutColumnProps> {

        var responsiveMode = this.props.responsiveMode;
        if (responsiveMode === undefined) {
            responsiveMode = ResponsiveMode.large;
        }
        var mobileMode = responsiveMode < ResponsiveMode.large;

        const links = !mobileMode || (mobileMode && this.state.showLinksWhenMobile) ? this.props.links.map((item: LinkModel) =>
            <MenuLink
                item={item}
                mobileMode={mobileMode}
                closeFlyout={this.closeFlyout}  // Passing the method down
            >
            </MenuLink>
        ) : null;

        return (
            <div
                className={`ms-Grid-col ms-sm12 ms-fontColor-neutralPrimary  ${styles.submenu} ${mobileMode ? "ms-slideDownIn10 ms-textAlignLeft" : ""}`}
                style={!mobileMode ? { marginLeft:'10px',
                    width: '22%'
                } : {}}
            >
                <FlyoutColumnHeading
                    item={this.props.header}
                    mobileMode={mobileMode}
                    headingTouched={this.handleHeadingTouched}
                    closeFlyout={this.closeFlyout}  // Passing the method down
                ></FlyoutColumnHeading>
                {links}
            </div>
        );
    }

    handleHeadingTouched() {
        this.setState((prevState, props) => {
            return {
                showLinksWhenMobile: !prevState.showLinksWhenMobile
            }
        });
    }



}
