import * as React from 'react';
import { withResponsiveMode, ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import styles from './MegaMenu.module.scss';
import { TopLevelMenu } from './TopLevelMenu';
import { Flyout } from './Flyout';
import { MobileMenu } from './MobileMenu';
import { TopLevelMenu as TopLevelMenuModel } from '../model/TopLevelMenu';
import QuestionMarkIconWithTooltip from './QuestionMarkIconWithTooltip';
import ChatbotIconWithTooltip from './ChatbotIconWithTooltip';
import AppPanel from './AppPanel';
import { Search20Regular } from '@fluentui/react-icons';
import { spfi, SPFx } from "@pnp/sp";
import AlertBar from './AlertBar';
import { TooltipHost } from 'office-ui-fabric-react';
// import { FaSearch, FaTimes } from 'react-icons/fa';

export interface IMegaMenuProps {
    topLevelMenuItems: TopLevelMenuModel[];
    responsiveMode?: ResponsiveMode;
    spfxContext: any;
}

export interface IMegaMenuState {
    showFlyout: boolean;
    cursorInTopLevelMenu: boolean;
    cursorInFlyout: boolean;
    selectedTopLevelItem: TopLevelMenuModel | null;
    showTopLevelMenuItemsWhenMobile: boolean;
    isSearchBoxVisible: boolean;
    isSearchBoxExpanded: boolean;
    isChatbotOpen: boolean;
    searchQuery: string;
}

@withResponsiveMode
export class MegaMenu extends React.Component<IMegaMenuProps, IMegaMenuState> {
    sp: any;
    megaMenuRef: React.RefObject<HTMLDivElement>;

    constructor(props: IMegaMenuProps) {
        super(props);

        this.sp = spfi().using(SPFx(props.spfxContext));
        this.megaMenuRef = React.createRef();

        this.state = {
            showFlyout: false,
            cursorInTopLevelMenu: false,
            cursorInFlyout: false,
            selectedTopLevelItem: null,
            showTopLevelMenuItemsWhenMobile: false,
            isSearchBoxVisible: false,
            isSearchBoxExpanded: false,
            isChatbotOpen: false,
            searchQuery: ''
        };

        this.handleToggleTopLevelMenu = this.handleToggleTopLevelMenu.bind(this);
        this.handleMobileMenuTouched = this.handleMobileMenuTouched.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleChatbotClick = this.handleChatbotClick.bind(this);
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

    handleOutsideClick(event: MouseEvent) {
        if (this.megaMenuRef.current && !this.megaMenuRef.current.contains(event.target as Node)) {
            this.setState({ showFlyout: false, selectedTopLevelItem: null });
        }
    }

    onSearch = (searchTerm: string): void => {
        const searchVerticalIdentifier = '%2Fsearch%2F1715802103063_15hccvoyq';
        const searchBaseUrl = `https://bmrn.sharepoint.com/_layouts/15/search.aspx?`;

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
    }

    handleChatbotClick() {
        this.setState(prevState => ({
            isChatbotOpen: !prevState.isChatbotOpen
        }));
        console.log('Chatbot toggle triggered');
    }

    handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ searchQuery: event.target.value });
    }

    handleClearSearch() {
        this.setState({ searchQuery: '' });
        this.setState({ isSearchBoxExpanded: false });
    }

    handleSearchClick() {
        this.onSearch(this.state.searchQuery);
    }

    public render(): React.ReactElement<IMegaMenuProps> {
        const { responsiveMode, spfxContext, topLevelMenuItems } = this.props;
        const { showFlyout, selectedTopLevelItem, showTopLevelMenuItemsWhenMobile, isSearchBoxExpanded, searchQuery } = this.state;
        const homeUrl = "https://bmrn.sharepoint.com/sites/bioweb-home";
        const mobileMode = (responsiveMode ?? ResponsiveMode.xLarge) < ResponsiveMode.xLarge;

        const topLevelItems = topLevelMenuItems.map(item => (
            <TopLevelMenu
                key={item.id.toString()}
                topLevelMenu={item}
                handleToggle={this.handleToggleTopLevelMenu}
                selectedTopLevelMenuId={selectedTopLevelItem ? selectedTopLevelItem.id : 0}
                widthPercent={100 / topLevelMenuItems.length}
            />
        ));

        const searchElement = isSearchBoxExpanded ? (
            <div className={styles.searchMenu}>
                <button type="button" className={styles.searchMenuClose} onClick={this.handleClearSearch}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.837967 1.07354L0.924757 0.969679C1.1851 0.709324 1.58924 0.680404 1.88155 0.882889L1.98541 0.969679L8.95508 7.9395L15.9247 0.969679C16.2176 0.676774 16.6925 0.676774 16.9855 0.969679C17.2783 1.26257 17.2783 1.73744 16.9855 2.03033L10.0156 9L16.9855 15.9696C17.2457 16.23 17.2747 16.6341 17.0722 16.9265L16.9855 17.0304C16.7251 17.2907 16.321 17.3196 16.0286 17.1171L15.9247 17.0304L8.95508 10.0605L1.98541 17.0304C1.69252 17.3232 1.21765 17.3232 0.924757 17.0304C0.631852 16.7375 0.631852 16.2626 0.924757 15.9696L7.89458 9L0.924757 2.03033C0.664402 1.76999 0.635482 1.36584 0.837967 1.07354Z" fill="#333333" />
                    </svg>
                </button>
                <input
                    type='text'
                    value={searchQuery}
                    onChange={this.handleInputChange}
                    placeholder="Search BioWeb..."
                    style={{ padding: '8px', border: 'none', outline: 'none' }}
                //  onBlur={() => this.setState({ isSearchBoxExpanded: false })}
                />
                <button type="button" className={styles.searchMenuButton} onClick={this.handleSearchClick}>
                    <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.2358 0.1875C15.877 0.1875 20.4501 4.76059 20.4501 10.4018C20.4501 12.8881 19.5617 15.1669 18.0851 16.9382L25.7495 24.6023C26.1121 24.965 26.1121 25.5529 25.7495 25.9155C25.4272 26.2379 24.9268 26.2737 24.5649 26.023L24.4363 25.9155L16.7722 18.2511C15.0009 19.7277 12.7221 20.6161 10.2358 20.6161C4.59458 20.6161 0.0214844 16.043 0.0214844 10.4018C0.0214844 4.76059 4.59458 0.1875 10.2358 0.1875ZM10.2358 2.04464C5.62025 2.04464 1.87863 5.78626 1.87863 10.4018C1.87863 15.0173 5.62025 18.7589 10.2358 18.7589C14.8513 18.7589 18.5929 15.0173 18.5929 10.4018C18.5929 5.78626 14.8513 2.04464 10.2358 2.04464Z" fill="#212121" />
                    </svg>
                </button>

            </div>
        ) : (
            <TooltipHost content="Search BioWeb" >
                <Search20Regular
                    className={styles.searchIcon}
                    title='Search'
                    style={{ height: '34px', width: '34px', cursor: 'pointer', float: 'right' }}
                    onClick={this.toggleSearch}
                    onMouseDown={() => this.setState({ isSearchBoxExpanded: true })}
                /> </TooltipHost>
        );
        return (
            <div ref={this.megaMenuRef}>
                {mobileMode && (
                    <MobileMenu handleTouched={this.handleMobileMenuTouched} spfxContext={spfxContext} topLevelMenuItems={topLevelMenuItems} />
                )}

                {(!mobileMode || showTopLevelMenuItemsWhenMobile) && (
                    <div className={`ms-Grid ${mobileMode ? "ms-slideDownIn10" : ""} ${styles.container}`}>
                        <div className={`ms-Grid-row ${styles.headerMenu}`}>
                            {!mobileMode && (
                                <div className={`ms-Grid-col ${styles.headerMenuLogo}`}>
                                    <a href={homeUrl} className={styles.logoHomeUrL}>
                                        <img src={require('../common/img/biomarin.svg')} alt="BioWeb" title="BioWeb" className={styles.logo} />
                                    </a>
                                </div>
                            )}
                            <div className={`ms-Grid-col ms-sm12 ms-md12 ms-lg6 ${styles.middleMenu}`} >
                                {topLevelItems}
                            </div>
                            {!mobileMode && (
                                <div className={`ms-Grid-col ms-sm12 ms-md12 ms-lg5 ${styles.rightNavContainer} ${styles.searchBoxContainer}`}>
                                    <div className={`ms-Grid-item ${styles.searchBoxContent}`}>{searchElement}</div>
                                    <div className='ms-Grid-item'>
                                        <QuestionMarkIconWithTooltip spfxContext={this.props.spfxContext} />
                                    </div>
                                    <div className='ms-Grid-item'>
                                        <ChatbotIconWithTooltip />

                                    </div>
                                    <div className='ms-Grid-item'>
                                        <AppPanel spfxContext={this.props.spfxContext} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {showFlyout && selectedTopLevelItem && (
                    <Flyout
                        handleFocused={this.handleFocusedFlyout}
                        handleLostFocus={this.handleLostFocusFlyout}
                        topLevelItem={selectedTopLevelItem}
                    />
                )}
                <AlertBar spfxContext={spfxContext} />
            </div>
        );
    }

    handleToggleTopLevelMenu = (selectedTopLevelItem: TopLevelMenuModel) => {
        this.setState(prevState => {
            const isAlreadySelected = prevState.selectedTopLevelItem && prevState.selectedTopLevelItem.id === selectedTopLevelItem.id;
            return {
                showFlyout: !isAlreadySelected || !prevState.showFlyout,
                selectedTopLevelItem: isAlreadySelected ? null : selectedTopLevelItem
            };
        });
    }

    handleFocusedTopLevelMenu(selectedTopLevelItem: TopLevelMenuModel) {
        this.setState((prevState, props) => ({
            showFlyout: prevState.showFlyout,
            cursorInTopLevelMenu: true,
            cursorInFlyout: prevState.cursorInFlyout,
            selectedTopLevelItem: selectedTopLevelItem || prevState.selectedTopLevelItem,
            showTopLevelMenuItemsWhenMobile: prevState.showTopLevelMenuItemsWhenMobile,
        }));

        this.checkFlyoutVisibility();
    }

    handleLostFocusTopLevelMenu() {
        this.setState((prevState, props) => ({
            showFlyout: prevState.showFlyout,
            cursorInTopLevelMenu: false,
            cursorInFlyout: prevState.cursorInFlyout,
            selectedTopLevelItem: prevState.selectedTopLevelItem,
            showTopLevelMenuItemsWhenMobile: prevState.showTopLevelMenuItemsWhenMobile,
        }));

        this.checkFlyoutVisibility();
    }

    handleFocusedFlyout(selectedTopLevelItem: TopLevelMenuModel) {
        this.setState((prevState, props) => ({
            showFlyout: prevState.showFlyout,
            cursorInTopLevelMenu: prevState.cursorInTopLevelMenu,
            cursorInFlyout: true,
            selectedTopLevelItem: selectedTopLevelItem,
            showTopLevelMenuItemsWhenMobile: prevState.showTopLevelMenuItemsWhenMobile,
        }));

        this.checkFlyoutVisibility();
    }

    handleLostFocusFlyout() {
        this.setState((prevState, props) => ({
            showFlyout: prevState.showFlyout,
            cursorInTopLevelMenu: prevState.cursorInTopLevelMenu,
            cursorInFlyout: false,
            selectedTopLevelItem: prevState.selectedTopLevelItem,
            showTopLevelMenuItemsWhenMobile: prevState.showTopLevelMenuItemsWhenMobile,
        }));

        this.checkFlyoutVisibility();
    }

    checkFlyoutVisibility() {
        this.setState((prevState, props) => {
            const showFlyout = prevState.cursorInTopLevelMenu || prevState.cursorInFlyout;
            return {
                showFlyout: showFlyout,
                cursorInTopLevelMenu: prevState.cursorInTopLevelMenu,
                cursorInFlyout: prevState.cursorInFlyout,
                selectedTopLevelItem: showFlyout ? prevState.selectedTopLevelItem : null,
                showTopLevelMenuItemsWhenMobile: prevState.showTopLevelMenuItemsWhenMobile,
            };
        });
    }

    handleMobileMenuTouched() {
        this.setState(prevState => {
            const showTopLevelMenuItemsWhenMobile = !prevState.showTopLevelMenuItemsWhenMobile;
            const showFlyout = prevState.showFlyout && showTopLevelMenuItemsWhenMobile;
            return {
                showFlyout: showFlyout,
                cursorInTopLevelMenu: prevState.cursorInTopLevelMenu,
                cursorInFlyout: prevState.cursorInFlyout,
                selectedTopLevelItem: prevState.selectedTopLevelItem,
                showTopLevelMenuItemsWhenMobile: showTopLevelMenuItemsWhenMobile
            };
        });
    }
}
