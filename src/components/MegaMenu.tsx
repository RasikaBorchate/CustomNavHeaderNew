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
import { FaSearch, FaTimes } from 'react-icons/fa';

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
        this.setState({  isSearchBoxExpanded: false});
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
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', borderBottom: '1px solid #000' }}>
               <button type="button" onClick={this.handleClearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <FaTimes />
                </button>
                <input
                    type='text'
                    value={searchQuery}
                    onChange={this.handleInputChange}
                    placeholder="Search BioWeb..."
                    style={{ width: '100%', padding: '8px', border: 'none', outline: 'none' }}
                  //  onBlur={() => this.setState({ isSearchBoxExpanded: false })}
                />
                <button type="button" onClick={this.handleSearchClick} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <FaSearch />
                </button>
                
            </div>
        ) : (
            <Search20Regular
                className={styles.searchIcon}
                title='Search'
                style={{ height: '34px', width: '34px', cursor: 'pointer', float: 'right' }}
                onClick={this.toggleSearch}
                onMouseDown={() => this.setState({ isSearchBoxExpanded: true })}
            />
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
                                        <img src={require('../common/img/biomarin.svg')} alt="Biomarin" title="Biomarin" className={styles.logo} />
                                    </a>
                                </div>
                            )}
                            <div className={`ms-Grid-col ms-sm12 ms-md12 ms-lg6`} >
                                {topLevelItems}
                            </div>
                            {!mobileMode && (
                                <div className={`ms-Grid-col ms-sm12 ms-md12 ms-lg5 ${styles.searchBoxContainer}`}>
                                    <div className={`ms-Grid-item ${styles.searchBoxContent}`}>{searchElement}</div>
                                    <div className='ms-Grid-item'>
                                        <QuestionMarkIconWithTooltip spfxContext={this.props.spfxContext} />
                                    </div>
                                    <div className='ms-Grid-item'>
                                        <ChatbotIconWithTooltip  />
                                       
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
