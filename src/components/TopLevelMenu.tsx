import * as React from 'react';
import { withResponsiveMode, ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';

import styles from './TopLevelMenu.module.scss';

import { TopLevelMenu as TopLevelMenuModel } from '../model/TopLevelMenu';
import { Icon } from 'office-ui-fabric-react';


export interface ITopLevelMenuProps {
    key: string;
    handleToggle: (selectedTopLevelItem: TopLevelMenuModel) => void; // Add this line
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
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
      //  this.handleTouched = this.handleTouched.bind(this);
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
        } else {
            this.toggleFlyout(); // Toggle the visibility of the Flyout
        }
    }
    public render(): React.ReactElement<ITopLevelMenuProps> {
        const { responsiveMode, topLevelMenu, selectedTopLevelMenuId } = this.props;
        const effectiveResponsiveMode = responsiveMode ?? ResponsiveMode.large;
        const mobileMode = effectiveResponsiveMode < ResponsiveMode.large;
        const isSelected = selectedTopLevelMenuId === topLevelMenu.id;
    
        return (
            <>
                <div
                    className={`
                        ms-Grid-col
                        ${isSelected ? "ms-bgColor-themeLighterAlt" : ""}
                        ${mobileMode ? "ms-sm12" : ""}
                        ms-textAlignLeft
                        ms-fontSize-l
                        ${isSelected ? "ms-fontColor-neutralPrimary" : "ms-fontColor-neutralPrimaryAlt"}
                        ${styles.container}
                    `}
                    style={{
                        width: !mobileMode ? "auto" : undefined,
                        padding: mobileMode ? "12px 18px" : "12px",
                        color: "#3C3C3C",
                        cursor:'pointer', 
                        
                        backgroundColor: mobileMode && isSelected ? "#eef6f7" : "#ffffff" // Apply different colors based on mobile mode and selection status
                    }}
                    onClick={this.handleClick}
                 //   onMouseEnter={this.handleMouseEnter}
                  //  onClick={this.handleTouched}
                   // onMouseLeave={this.handleMouseLeave}
                >
                    {mobileMode && <Icon iconName="CircleFill" className={styles.iconStylefront} />}
                    <div onClick={() => this.props.handleToggle(this.props.topLevelMenu)}  style={{borderBottom: isSelected && !mobileMode ? "2px solid #043591" : "none",paddingBottom:"4px"}}>
           {topLevelMenu.text}</div>
                    {isSelected && mobileMode && <Icon iconName="AcceptMedium" className={styles.iconStyleback} />}
                </div>
            </>
        );
    }
    
    

    handleMouseEnter() {

      //  var responsiveMode = this.props.responsiveMode;
     ///   if (responsiveMode === undefined) {
     //       responsiveMode = ResponsiveMode.large;
      //  }
      //  var mobileMode = responsiveMode < ResponsiveMode.large;

        
    }


    handleTouched() {
      
    }


    handleMouseLeave() {

     // var responsiveMode = this.props.responsiveMode;
     //   if (responsiveMode === undefined) {
     //    responsiveMode = ResponsiveMode.large;
     //   }
       

    }


}
