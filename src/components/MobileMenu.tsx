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
import { Link } from '../model/Link';

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
        selectedSubMenuItem: null
    };

    constructor(props: IMobileMenuProps) {
        super(props);
        this.sp = spfi().using(SPFx(props.spfxContext));
        this.menuRef = React.createRef();
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

    onSearch = (searchTerm: string): void => {
        const searchVerticalIdentifier = '%2Fsearch%2F1715802103063_15hccvoyq';
        const searchBaseUrl = `https://bmrn.sharepoint.com/_layouts/15/sharepoint.aspx?`;

        const queryParams = new URLSearchParams({
            q: searchTerm,
            v: searchVerticalIdentifier
        });

        window.location.href = `${searchBaseUrl}?${queryParams.toString()}`;
    };

    toggleSearch = () => {
        this.setState(prevState => ({
            isSearchBoxVisible: !prevState.isSearchBoxVisible,
            isSearchBoxExpanded: !prevState.isSearchBoxExpanded
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
        const { isMenuOpen, isFlyoutOpen, isSearchBoxExpanded, isAppPanelOpen, selectedMenuItem, selectedSubMenuItem } = this.state;
        const iconClassName = isMenuOpen ? "ms-Icon ms-Icon--Cancel" : "ms-Icon ms-Icon--GlobalNavButton";
        const homeUrl = "https://bmrn.sharepoint.com/sites/bioweb-home";
        const { topLevelMenuItems } = this.props;
        const iconClassNameFlyout = isFlyoutOpen ? "ms-Icon ms-Icon--ChevronUpSmall" : "ms-Icon ms-Icon--More";

        const searchElement = isSearchBoxExpanded ? (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <SearchBox
                    placeholder="Search BioWeb..."
                    onSearch={this.onSearch}
                    styles={{ root: { width: '100%' } }}
                    onBlur={() => this.setState({ isSearchBoxExpanded: false })}
                    underlined={true}
                />
                <Icon
                    iconName="Cancel"
                    onClick={this.toggleSearch}
                    style={{ cursor: 'pointer', marginLeft: '8px' }}
                />
            </div>
        ) : (
            <Icon
                iconName="Search"
                onClick={this.toggleSearch}
                className={styles1.searchIcon}
                onMouseDown={() => this.setState({ isSearchBoxExpanded: true })}
            />
        );

        return (
            <div className={`ms-Grid ${styles.container}`} ref={this.menuRef}>
                <div className={`ms-Grid-row ${styles.row}`}>
                    <div className={`ms-Grid-col ms-sm1 ${styles.togglemenumobile}`}>
                        <i className={iconClassName} aria-hidden="true" style={{ cursor: 'pointer' }} onClick={this.toggleMenu} title='Toggle Navigation Pane' />
                    </div>
                    <div className={`ms-Grid-col ms-sm7 ${styles.logomobile}`}>
                        <a href={homeUrl} className={styles1.logoHomeUrL}><img src={require('../common/img/biomarin.svg')} alt="Biomarin" style={{ width: '120px' }} /></a>
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
