import * as React from 'react';
import { withResponsiveMode, ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import styles from './TopLevelMenu.module.scss';
import { TopLevelMenu as TopLevelMenuModel } from '../model/TopLevelMenu';

export interface ITopLevelMenuProps {
    key: string;
    handleToggle: (selectedTopLevelItem: TopLevelMenuModel) => void;
    topLevelMenu: TopLevelMenuModel;
    selectedTopLevelMenuId: number;
    responsiveMode?: ResponsiveMode;
    widthPercent: number;
}

export interface ITopLevelMenuState {
    showFlyout: boolean;
}

@withResponsiveMode
export class TopLevelMenu extends React.Component<ITopLevelMenuProps, ITopLevelMenuState> {
    constructor(props: ITopLevelMenuProps) {
        super(props);
        this.state = {
            showFlyout: false,
        };
    }

    toggleFlyout = () => {
        this.setState(prevState => ({
            showFlyout: !prevState.showFlyout,
        }));
    }

    handleClick = () => {
        const { topLevelMenu } = this.props;
        if (topLevelMenu.url) {
            window.location.href = topLevelMenu.url;
        } else if (topLevelMenu.columns && topLevelMenu.columns.length > 0) {
            this.toggleFlyout();
        }
    }

    public render(): React.ReactElement<ITopLevelMenuProps> {
        const { topLevelMenu, selectedTopLevelMenuId } = this.props;
        const isSelected = selectedTopLevelMenuId === topLevelMenu.id;

        return (
            <div
                className={`
                    ms-Grid-col
                    ${isSelected ? "ms-bgColor-themeLighterAlt" : ""}
                    ms-textAlignLeft
                    ms-fontSize-m
                    ${isSelected ? "ms-fontColor-neutralPrimary" : "ms-fontColor-neutralPrimaryAlt"}
                    ${styles.container}
                `}
                style={{
                    padding: "12px",
                    color: "#3C3C3C",
                    cursor: 'pointer',
                    backgroundColor: isSelected ? "#eef6f7" : "#ffffff"
                }}
                onClick={this.handleClick}
            >
                <div
                    onClick={(event) => {
                        event.stopPropagation();
                        this.props.handleToggle(this.props.topLevelMenu);
                    }}
                    style={{ borderBottom: isSelected ? "2px solid #043591" : "none", paddingBottom: "4px" }}
                >
                    {topLevelMenu.text}
                </div>
            </div>
        );
    }
}
