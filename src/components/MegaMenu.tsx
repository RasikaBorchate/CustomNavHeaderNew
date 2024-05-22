import * as React from 'react';
import { withResponsiveMode, ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import styles from './MegaMenu.module.scss';
import { TopLevelMenu } from './TopLevelMenu';
import { Flyout } from './Flyout';
import { MobileMenu } from './MobileMenu';
import { TopLevelMenu as TopLevelMenuModel } from '../model/TopLevelMenu';
import { SearchBox } from 'office-ui-fabric-react';
import QuestionMarkIconWithTooltip from './QuestionMarkIconWithTooltip';
import ChatbotIconWithTooltip from './ChatbotIconWithTooltip';
import AppPanel from './AppPanel';
import { Search20Regular } from '@fluentui/react-icons';
import { spfi, SPFx } from "@pnp/sp";
import AlertBar from './AlertBar';

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
        };

        this.handleToggleTopLevelMenu = this.handleToggleTopLevelMenu.bind(this);
        this.handleMobileMenuTouched = this.handleMobileMenuTouched.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
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
        const searchVerticalIdentifier = 'BIO_WEB_SEARCH_VERTICAL_ID';
        const searchBaseUrl = `/_layouts/15/search.aspx/siteall`;

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

    public render(): React.ReactElement<IMegaMenuProps> {
        const { responsiveMode, spfxContext, topLevelMenuItems } = this.props;
        const { showFlyout, selectedTopLevelItem, showTopLevelMenuItemsWhenMobile, isSearchBoxExpanded } = this.state;
        const homeUrl = spfxContext._pageContext._web.absoluteUrl;
        const mobileMode = (responsiveMode ?? ResponsiveMode.large) < ResponsiveMode.large;

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
            <SearchBox
                placeholder="Search BioWeb..."
                onSearch={this.onSearch}
                styles={{ root: { width: '100%', borderBottom: '1px solid #000' } }}
                className={styles.searchBoxWrapper}
                onBlur={() => this.setState({ isSearchBoxExpanded: false })}
                underlined={true}
            />
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
                    <MobileMenu handleTouched={this.handleMobileMenuTouched} spfxContext={spfxContext} />
                )}

                {(!mobileMode || (mobileMode && showTopLevelMenuItemsWhenMobile)) && (
                    <div className={`ms-Grid ms-slideDownIn10 ${styles.container}`}>
                        <div className="ms-Grid-row">
                            {!mobileMode && (
                                <div className={`ms-Grid-col ms-lg2 ${styles.headerMenuLogo}`}>
                                    <a href={homeUrl} className={styles.logoHomeUrL}>
                                        <img src={require('../common/img/biomarin.svg')} alt="Biomarin" title="Biomarin" className={styles.logo} />
                                    </a>
                                </div>
                            )}
                            <div className={`ms-Grid-col ms-sm12 ms-md12 ms-lg5 ${styles.menuContainer}`} >
                                {topLevelItems}
                            </div>
                            {!mobileMode && (
                                <div className={`ms-Grid-col ms-sm12 ms-md12 ms-lg5 ${styles.searchBoxContainer}`}>
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
