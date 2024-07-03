import * as React from 'react';
import styles from './MobileMenu.module.scss';
import { withResponsiveMode, ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import styles1 from './MegaMenu.module.scss';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import QuestionMarkIconWithTooltip from './QuestionMarkIconWithTooltip';
import ChatbotIconWithTooltip from './ChatbotIconWithTooltip';
import AppPanel from './AppPanel';
import { spfi, SPFx } from "@pnp/sp";
import { TopLevelMenu as TopLevelMenuModel } from '../model/TopLevelMenu';
import { FlyoutColumn } from '../model/FlyoutColumn';
import { Link } from '../model/Link';
import { TooltipHost } from 'office-ui-fabric-react';

export interface IMobileMenuProps {
    handleTouched?: () => void;
    responsiveMode?: ResponsiveMode;
    spfxContext: any;
    topLevelMenuItems: TopLevelMenuModel[];
}

export interface IMobileMenuState {
    isMenuOpen: boolean;
    isFlyoutOpen: boolean;
    isSearchBoxExpanded: boolean;
    isSearchBoxVisible: boolean;
    isAppPanelOpen: boolean;
    openSubMenu: { [key: string]: boolean };
    selectedMenuItem: string | null;
    selectedSubMenuItem: string | null;
    searchQuery: string;
}

@withResponsiveMode
export class MobileMenu extends React.Component<IMobileMenuProps, IMobileMenuState> {
    sp: any;
    menuRef: React.RefObject<HTMLDivElement>;

    state: IMobileMenuState = {
        isMenuOpen: false,
        isFlyoutOpen: false,
        isSearchBoxExpanded: false,
        isSearchBoxVisible: false,
        isAppPanelOpen: false,
        openSubMenu: {},
        selectedMenuItem: null,
        selectedSubMenuItem: null,
        searchQuery: ''
    };

    constructor(props: IMobileMenuProps) {
        super(props);
        this.sp = spfi().using(SPFx(props.spfxContext));
        this.menuRef = React.createRef();
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleClearSearch = this.handleClearSearch.bind(this);
        this.handleSearchClick = this.handleSearchClick.bind(this);
    }

    componentDidMount() {
        document.addEventListener('click', this.handleOutsideClick);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleOutsideClick);
    }

    handleOutsideClick = (event: MouseEvent) => {
        if (this.menuRef.current && !this.menuRef.current.contains(event.target as Node)) {
            this.setState({
                isMenuOpen: false,
                isFlyoutOpen: false,
                isSearchBoxExpanded: false,
                isSearchBoxVisible: false,
                isAppPanelOpen: false
            });
        }
    };
    handleLogoClick = () => {
       
        this.setState({
            isMenuOpen: false,
            isFlyoutOpen: false,
            isSearchBoxExpanded: false,
            isSearchBoxVisible: false,
            isAppPanelOpen: false
        }, () => {
            window.location.href = "https://bmrn.sharepoint.com/sites/bioweb-home"; // Redirect after state updates
        });
    };
    toggleMenu = () => {
        this.setState(prevState => ({
            isMenuOpen: !prevState.isMenuOpen,
            isFlyoutOpen: prevState.isMenuOpen ? prevState.isFlyoutOpen : false,
            isSearchBoxExpanded: false,
            isSearchBoxVisible: false,
            isAppPanelOpen: false
        }));
    };

    toggleSubMenu = (menuId: string) => {
        this.setState(prevState => ({
            openSubMenu: {
                ...prevState.openSubMenu,
                [menuId]: !prevState.openSubMenu[menuId]
            },
            selectedMenuItem: prevState.selectedMenuItem === menuId ? null : menuId,
            selectedSubMenuItem: null
        }));
    };

    toggleFlyout = () => {
        this.setState(prevState => ({
            isFlyoutOpen: !prevState.isFlyoutOpen,
            isMenuOpen: prevState.isFlyoutOpen ? prevState.isMenuOpen : false,
            isSearchBoxExpanded: false,
            isSearchBoxVisible: false,
            isAppPanelOpen: false
        }));
    };

    toggleAppPanel = () => {
        this.setState(prevState => ({
            isAppPanelOpen: !prevState.isAppPanelOpen,
            isMenuOpen: false,
            isFlyoutOpen: false,
            isSearchBoxExpanded: false,
            isSearchBoxVisible: false
        }));
    };

    selectSubMenuItem = (subMenuItemId: string) => {
        this.setState({
            selectedSubMenuItem: subMenuItemId
        });
    };

    handleChatbotClick = () => {
        console.log('Chatbot icon clicked');
    };

    handleTopLevelItemClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, item: TopLevelMenuModel) => {
        const { selectedMenuItem } = this.state;

        if (selectedMenuItem === item.id.toString()) {
            this.toggleSubMenu(item.id.toString());
        } else {
            if (selectedMenuItem) {
                this.toggleSubMenu(selectedMenuItem);
            }
            if (!item.url) {
                event.preventDefault();
                this.toggleSubMenu(item.id.toString());
            }
        }
    };

    onSearch = (searchTerm: string): void => {
       // const searchVerticalIdentifier = '%2Fsearch%2F1715802103063_15hccvoyq';
        const searchBaseUrl = `https://bmrn.sharepoint.com/sites/BioWeb-Home/_layouts/15/search.aspx/1715802103063_15hccvoyq`;

        const queryParams = new URLSearchParams({
            q: searchTerm,
          //  v: searchVerticalIdentifier
        });

        window.location.href = `${searchBaseUrl}?${queryParams.toString()}`;
    };
    handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            this.handleSearchClick(); // assuming this method triggers the search
        }
    }
    toggleSearch = () => {
        this.setState(prevState => ({
            isSearchBoxVisible: !prevState.isSearchBoxVisible,
            isSearchBoxExpanded: !prevState.isSearchBoxExpanded
        }));
    }

    handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ searchQuery: event.target.value });
    }

    handleClearSearch() {
        this.setState({ searchQuery: '', isSearchBoxExpanded: false });
    }

    handleSearchClick() {
        this.onSearch(this.state.searchQuery);
    }

    renderSubMenu(columns: FlyoutColumn[], parentId: string) {
        const { openSubMenu, selectedSubMenuItem } = this.state;
        return (
            <ul className={styles.subMenu}>
                {columns.map((column, columnIndex) => (
                    <li key={`${parentId}-${columnIndex}`}>
                        <div className={styles.subMenuItem} onClick={() => this.toggleSubMenu(`${parentId}-${columnIndex}`)}>
                            {column.links && column.links.length > 0 && (
                                <Icon className={styles.subMenuItemicon} iconName={openSubMenu[`${parentId}-${columnIndex}`] ? "ChevronUp" : "ChevronDown"} />
                            )}
                            <span className={styles.subMenuItemtext}>{column.heading ? column.heading.text : 'Submenu'}</span>
                        </div>
                        {column.links && openSubMenu[`${parentId}-${columnIndex}`] && (
                            <ul className={styles.subsubMenu}>
                                {column.links.map((link: Link, linkIndex) => (
                                    <li key={link.text}>
                                        <div
                                            className={styles.subsubMenuItem}
                                            onClick={() => this.selectSubMenuItem(`${parentId}-${columnIndex}-${linkIndex}`)}
                                            style={{ backgroundColor: selectedSubMenuItem === `${parentId}-${columnIndex}-${linkIndex}` ? '#eef6f7' : 'transparent' }}
                                        >
                                            <a href={link.url} target={link.openInNewTab ? "_blank" : "_self"}>{link.text}</a>
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
        const { isMenuOpen, isFlyoutOpen, isSearchBoxExpanded, isAppPanelOpen, selectedMenuItem, selectedSubMenuItem, searchQuery } = this.state;
        const iconClassName = isMenuOpen ? "ms-Icon ms-Icon--Cancel" : "ms-Icon ms-Icon--GlobalNavButton";
      
        const { topLevelMenuItems } = this.props;
        const iconClassNameFlyout = isFlyoutOpen ? "ms-Icon ms-Icon--ChevronUpSmall" : "ms-Icon ms-Icon--More";

        const searchElement = isSearchBoxExpanded ? (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                 <div className={styles.searchMenu}>
               <button type="button" className={styles.searchMenuClose} onClick={this.handleClearSearch}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.837967 1.07354L0.924757 0.969679C1.1851 0.709324 1.58924 0.680404 1.88155 0.882889L1.98541 0.969679L8.95508 7.9395L15.9247 0.969679C16.2176 0.676774 16.6925 0.676774 16.9855 0.969679C17.2783 1.26257 17.2783 1.73744 16.9855 2.03033L10.0156 9L16.9855 15.9696C17.2457 16.23 17.2747 16.6341 17.0722 16.9265L16.9855 17.0304C16.7251 17.2907 16.321 17.3196 16.0286 17.1171L15.9247 17.0304L8.95508 10.0605L1.98541 17.0304C1.69252 17.3232 1.21765 17.3232 0.924757 17.0304C0.631852 16.7375 0.631852 16.2626 0.924757 15.9696L7.89458 9L0.924757 2.03033C0.664402 1.76999 0.635482 1.36584 0.837967 1.07354Z" fill="#333333"/>
                    </svg>
                </button>
                <input
                    type='text'
                    value={searchQuery}
                    onChange={this.handleInputChange}
                    onKeyPress={this.handleKeyPress}
                    placeholder="Search BioWeb..."
                    style={{padding: '8px', border: 'none', outline: 'none' }}
                  //  onBlur={() => this.setState({ isSearchBoxExpanded: false })}
                />
                <button type="button" className={styles.searchMenuButton} onClick={this.handleSearchClick}>
                    <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.2358 0.1875C15.877 0.1875 20.4501 4.76059 20.4501 10.4018C20.4501 12.8881 19.5617 15.1669 18.0851 16.9382L25.7495 24.6023C26.1121 24.965 26.1121 25.5529 25.7495 25.9155C25.4272 26.2379 24.9268 26.2737 24.5649 26.023L24.4363 25.9155L16.7722 18.2511C15.0009 19.7277 12.7221 20.6161 10.2358 20.6161C4.59458 20.6161 0.0214844 16.043 0.0214844 10.4018C0.0214844 4.76059 4.59458 0.1875 10.2358 0.1875ZM10.2358 2.04464C5.62025 2.04464 1.87863 5.78626 1.87863 10.4018C1.87863 15.0173 5.62025 18.7589 10.2358 18.7589C14.8513 18.7589 18.5929 15.0173 18.5929 10.4018C18.5929 5.78626 14.8513 2.04464 10.2358 2.04464Z" fill="#212121"/>
                    </svg>
                </button>
                
            </div>
            </div>
        ) : (
            <TooltipHost content="Search BioWeb" >
                 <Icon
                iconName="Search"
                onClick={this.toggleSearch}
                className={styles1.searchIcon}
                onMouseDown={() => this.setState({ isSearchBoxExpanded: true })}
            /></TooltipHost>
        );

        return (
            <div className={`ms-Grid ${styles.container}`} ref={this.menuRef}>
                <div className={`ms-Grid-row ${styles.row}`}>
                    <div className={`ms-Grid-col ms-sm1 ${styles.togglemenumobile}`}>
                        <i className={iconClassName} aria-hidden="true" style={{ cursor: 'pointer' }} onClick={this.toggleMenu} title='Toggle Navigation Pane' />
                    </div>
                    <div className={`ms-Grid-col ms-sm7 ${styles.logomobile} ${styles1.logoHomeUrL}`} onClick={this.handleLogoClick}>
                         <img src={require('../common/img/biomarin.svg')} alt="BioWeb" style={{ width: '120px' }} />
                    </div>
                    <div className={`ms-Grid-col ms-sm4 ${styles.righticonmobile}`}>
                        <i className={iconClassNameFlyout} aria-hidden="true" style={{ cursor: 'pointer' }} onClick={this.toggleFlyout} title='Toggle more' />
                    </div>
                </div>
                {isMenuOpen && (
                    <div className={styles.menuPanel}>
                        <ul className={styles.mainMenu}>
                            {topLevelMenuItems.map(item => {
                                const isSelected = selectedMenuItem === item.id.toString() || (selectedSubMenuItem && selectedSubMenuItem.startsWith(item.id.toString()));
                                return (
                                    <li key={item.id}>
                                        <a
                                            href={item.url}
                                            target={"_blank" }
                                            onClick={(event) => this.handleTopLevelItemClick(event, item)} style={{textDecoration:"none"}}
                                        >
                                            <div
                                                className={styles.menuItem}
                                                style={{ backgroundColor: isSelected ? '#eef6f7' : 'transparent' }}
                                            >
                                                <Icon iconName="CircleFill" className={styles.iconStylefront} />
                                                {item.text}
                                                {isSelected && (
                                                    <Icon iconName="AcceptMedium" className={styles.iconStyleback} />
                                                )}
                                            </div>
                                        </a>
                                        {item.columns && this.state.openSubMenu[item.id.toString()] && this.renderSubMenu(item.columns, item.id.toString())}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
                {isFlyoutOpen && (
                    <div className={` ${styles.flyoutpanel}`}>
                        <div className={`ms-Grid-col ms-sm12 ms-md12 ms-lg12 ${styles1.searchBoxContainer}`}>
                            {searchElement}
                            {!isSearchBoxExpanded && <QuestionMarkIconWithTooltip spfxContext={this.props.spfxContext} />}
                            {!isSearchBoxExpanded && <ChatbotIconWithTooltip />}
                            {!isSearchBoxExpanded && <div><AppPanel spfxContext={this.props.spfxContext} /></div>}
                        </div>
                    </div>
                )}
                {isAppPanelOpen && (
                    <div ref={this.menuRef}>
                        <AppPanel spfxContext={this.props.spfxContext} />
                    </div>
                )}
            </div>
        );
    }
}
