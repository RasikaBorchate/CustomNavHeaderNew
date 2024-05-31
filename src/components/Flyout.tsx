import * as React from 'react';
import styles from './Flyout.module.scss';
import { FlyoutColumn } from './FlyoutColumn';
import { TopLevelMenu as TopLevelMenuModel } from '../model/TopLevelMenu';
import { FlyoutColumn as FlyoutColumnModel } from '../model/FlyoutColumn';

export interface IFlyoutProps {
    topLevelItem: TopLevelMenuModel;
    handleFocused: (topLevelItem: TopLevelMenuModel) => void;
    handleLostFocus: () => void;
}

export interface IFlyoutState {}

export class Flyout extends React.Component<IFlyoutProps, IFlyoutState> {
    constructor(props: IFlyoutProps) {
        super(props);
        this.handleFocused = this.handleFocused.bind(this);
    }

    public render(): React.ReactElement<IFlyoutProps> | null {
        if (!this.props.topLevelItem || !this.props.topLevelItem.columns) {
            return null;
        }

        const columns = this.props.topLevelItem.columns.map((column: FlyoutColumnModel, index: number) => {
            const header: any = column.heading ?? "";
            const links = column.links ?? [];
            const key = header || `column-${index}`;

            return (
                <FlyoutColumn
                    key={key}
                    header={header}
                    links={links}
                    widthPercent={25} // 100 / 4 columns = 25% each
                />
            );
        });

        const rows = [];
        for (let i = 0; i < columns.length; i += 4) {
            rows.push(
                <div className="ms-Grid-row" key={`row-${i / 4}`}>
                    
                    {columns.slice(i, i + 4)}
                    
                </div>
            );
        }

        return (
            <div
                className={`ms-Grid-col ms-lg12 ms-sm12 ms-slideDownIn10 ${styles.container}`}
                onMouseEnter={this.handleFocused}
                onClick={this.handleFocused}
                onTouchStart={this.handleFocused}
                onMouseLeave={this.props.handleLostFocus}
            >
                <div className="ms-Grid">
                    {rows}
                </div>
            </div>
        );
    }

    handleFocused() {
        this.props.handleFocused(this.props.topLevelItem);
    }
}
