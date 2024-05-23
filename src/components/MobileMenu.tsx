import * as React from 'react';
import styles from './MobileMenu.module.scss';
import { withResponsiveMode, ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import styles1 from './MegaMenu.module.scss';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import QuestionMarkIconWithTooltip from './QuestionMarkIconWithTooltip';
import ChatbotIconWithTooltip from './ChatbotIconWithTooltip';
import AppPanel from './AppPanel';
import { spfi, SPFx } from "@pnp/sp";
import { TopLevelMenu as TopLevelMenuModel } from '../model/TopLevelMenu';
import { FlyoutColumn } from '../model/FlyoutColumn';
import { Link } from '../model/Link'; // Import the Link class


//import {WebPartContext} from '@microsoft/sp-webpart-base'
export interface IMobileMenuProps {
    handleTouched?: () => void;
    responsiveMode?: ResponsiveMode;
    spfxContext: any;
    topLevelMenuItems: TopLevelMenuModel[];
}

export interface IMobileMenuState {
    isMenuOpen: boolean;
    isFlyoutOpen: boolean;  // State for flyout visibility
    isSearchBoxExpanded: boolean;
    isSearchBoxVisible: boolean;
    openSubMenu: { [key: string]: boolean }; // To keep track of open submenus
}

@withResponsiveMode
export class MobileMenu extends React.Component<IMobileMenuProps, IMobileMenuState> {
    sp: any;
    constructor(props: IMobileMenuProps) {
      
        super(props);
        this.sp = spfi().using(SPFx(props.spfxContext));
        this.state = {
            isMenuOpen: false,
            isFlyoutOpen: false,
            isSearchBoxExpanded: false,
            isSearchBoxVisible: false,
            openSubMenu: {}
        };
    }

    toggleMenu = () => {
        this.setState(prevState => ({
            isMenuOpen: !prevState.isMenuOpen
        }));
        if (this.props.handleTouched) {
            this.props.handleTouched();
        }
    };

    toggleSubMenu = (menuId: string) => {
        this.setState(prevState => ({
            openSubMenu: {
                ...prevState.openSubMenu,
                [menuId]: !prevState.openSubMenu[menuId]
            }
        }));
    };


    toggleFlyout = () => {
        this.setState(prevState => ({
            isFlyoutOpen: !prevState.isFlyoutOpen  // Toggle flyout visibility
        }));
    };

    // This method is called when the search is performed
    onSearch = (searchTerm: string): void => {
        // Construct the URL for the Microsoft Search results page
        // Replace 'BIO_WEB_SEARCH_VERTICAL_ID' with your actual search vertical identifier for BioWeb
        const searchVerticalIdentifier = 'BIO_WEB_SEARCH_VERTICAL_ID';
        const searchBaseUrl = `/_layouts/15/search.aspx/siteall`;

        // Construct the query parameter
        // If you need to search only within sites prefixed with “/sites/BioWeb-“, adjust the query as needed
        const queryParams = new URLSearchParams({
            q: searchTerm,
            v: searchVerticalIdentifier // This parameter should correspond to the identifier for your custom search vertical
        });

        // Redirect to the search results page with the search term and vertical identifier
        window.location.href = `${searchBaseUrl}?${queryParams.toString()}`;
    };
    toggleSearch = () => {
        this.setState(prevState => ({
            isSearchBoxVisible: !prevState.isSearchBoxVisible,
            isSearchBoxExpanded: !prevState.isSearchBoxExpanded
        }));
    };

    renderSubMenu(columns: FlyoutColumn[], parentId: string) {
        const { openSubMenu } = this.state;
        return (
            <ul className={styles.subMenu}>
                {columns.map((column, columnIndex) => (
                    <li key={`${parentId}-${columnIndex}`}>
                        <div className={styles.subMenuItem} onClick={() => this.toggleSubMenu(`${parentId}-${columnIndex}`)}>
                            {column.heading ? column.heading.text : 'Submenu'}
                            {column.links && column.links.length > 0 && (
                                <Icon iconName={openSubMenu[`${parentId}-${columnIndex}`] ? "ChevronUp" : "ChevronDown"} />
                            )}
                        </div>
                        {column.links && openSubMenu[`${parentId}-${columnIndex}`] && (
                            <ul className={styles.subMenu}>
                                {column.links.map((link: Link) => (
                                    <li key={link.text}>
                                        <div className={styles.subMenuItem}>
                                            <a href={link.url || '#'} target={link.openInNewTab ? "_blank" : "_self"}>{link.text}</a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        );
    }
    public render(): React.ReactElement<IMobileMenuProps> {

        const { isMenuOpen,  isFlyoutOpen } = this.state;
        const iconClassName = isMenuOpen ? "ms-Icon ms-Icon--Cancel" : "ms-Icon ms-Icon--GlobalNavButton";
        const homeUrl = "https://bmrn.sharepoint.com/sites/bioweb-home";
        const { topLevelMenuItems } = this.props;
        const iconClassNameFlyout = isFlyoutOpen ? "ms-Icon ms-Icon--ChevronUpSmall" : "ms-Icon ms-Icon--More";
       

        // Search box or icon based on state
        const searchElement = this.state.isSearchBoxExpanded ? (
            <SearchBox
                placeholder="Search BioWeb..."
                onSearch={this.onSearch}
                styles={{ root: { width: '100%' } }}
                onBlur={() => this.setState({ isSearchBoxExpanded: false })}// Optionally hide search when it loses focus
                underlined={true}
            />
        ) : (
            <Icon
                iconName="Search"
                onClick={this.toggleSearch}
                className={styles1.searchIcon}
                // Add the following line to handle expanding the search box on click
                onMouseDown={() => this.setState({ isSearchBoxExpanded: true })}
            />
        );




          return (
            <div className={`ms-Grid ${styles.container}`}>
                <div  className={`ms-Grid-row ${styles.row}`}     >
                    <div className={`ms-Grid-col ms-sm1 ${styles.togglemenumobile}`}>
                        <i className={iconClassName } aria-hidden="true" style={{ cursor: 'pointer' }} onClick={this.toggleMenu} title='Toggle Navigation Pane' />
                    </div>
                    <div className={`ms-Grid-col ms-sm7 ${styles.logomobile}`} >
                        <a href={homeUrl} className={styles1.logoHomeUrL}><img src={require('../common/img/biomarin.svg')} alt="Biomarin" style={{ width: '120px' }} /></a>
                    </div>
                    <div className={`ms-Grid-col ms-sm4 ${styles.righticonmobile}`} >
                        <i className={iconClassNameFlyout} aria-hidden="true" style={{ cursor: 'pointer' }} onClick={this.toggleFlyout} title='Toggle more' />

                    </div>


                </div>
                {isMenuOpen && (
                    <div className={styles.menuPanel}>
                        <ul className={styles.mainMenu}>
                            {topLevelMenuItems.map(item => (
                                <li key={item.id}>
                                    <div className={styles.menuItem} onClick={() => this.toggleSubMenu(item.id.toString())}>
                                        {item.text}
                                        {item.columns && item.columns.length > 0 && (
                                            <Icon iconName={this.state.openSubMenu[item.id.toString()] ? "ChevronUp" : "ChevronDown"} />
                                        )}
                                    </div>
                                    {item.columns && this.state.openSubMenu[item.id.toString()] && this.renderSubMenu(item.columns, item.id.toString())}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {isFlyoutOpen  && <div className={` ${styles.flyoutpanel}`} >
                    <div className={`ms-Grid-col ms-sm12 ms-md12 ms-lg4 ${styles1.searchBoxContainer}`}>
                        {searchElement}
                        {!this.state.isSearchBoxExpanded && <QuestionMarkIconWithTooltip spfxContext={this.props.spfxContext} />}
                         {!this.state.isSearchBoxExpanded && <ChatbotIconWithTooltip />}
                         {!this.state.isSearchBoxExpanded && <AppPanel spfxContext={this.props.spfxContext} />}
                    </div>
                </div>}

            </div>
        );
    }
}
