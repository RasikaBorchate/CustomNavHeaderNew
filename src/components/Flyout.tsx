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

export interface IFlyoutState {
}
export class Flyout extends React.Component<IFlyoutProps, IFlyoutState> {
    constructor(props: IFlyoutProps) {
        super(props);
        this.handleFocused = this.handleFocused.bind(this);
    }

    public render(): React.ReactElement<IFlyoutProps> | null { // <- Explicitly include 'null' as a return type
        if (!this.props.topLevelItem || !this.props.topLevelItem.columns) {
            return null;
        }

        
        const columnsLength = this.props.topLevelItem.columns?.length ?? 0; // Use optional chaining with nullish coalescing

        const columns = this.props.topLevelItem.columns.map((column: FlyoutColumnModel, index: number) => {
            const header:any = column.heading ?? ""; // Use nullish coalescing operator
            const links = column.links ?? [];
    
            const key = header || `column-${index}`; // Ensure key is a string
    
            return (
                <FlyoutColumn
                    key={key} // Use key here
                    header={header}
                    links={links}
                    widthPercent={columnsLength ? (66 / columnsLength) : 0} // Use the calculated columnsLength here
                />
            );
        });
    
        return (
            <div
                className={`ms-Grid-col ms-lg12 ms-sm12  ms-slideDownIn10 ${styles.container}`}
                onMouseEnter={this.handleFocused}
                onClick={this.handleFocused}
                onTouchStart={this.handleFocused}
                onMouseLeave={this.props.handleLostFocus}
            >
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-lg2 ms-hiddenSm">
                        </div>
                        {columns}
                        <div className="ms-Grid-col ms-lg2 ms-hiddenSm">
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    handleFocused() {
        this.props.handleFocused(this.props.topLevelItem);
    }
}
