import * as React from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { DefaultPalette, IconButton, IStackItemStyles, IStackStyles, IStackTokens, PrimaryButton, Stack, TextField } from 'office-ui-fabric-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styles from './AppPanel.module.scss';
import { DropResult } from 'react-beautiful-dnd';
import { Grid16Regular, TextBulletList20Regular, GridDots20Regular } from '@fluentui/react-icons';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import '@pnp/sp/site-users';

import { API_URLS } from '../common/Config';

export interface IAppPanelProps {
  spfxContext: any; // Consider using a specific type for context if available
}

export interface IAppItem {
  Title: string;
  Icon: string;
  Link: any;
  OpenInNewTab: any;
}

const appstackStyles: IStackStyles = {
  root: {
    background: 'linear-gradient(to right, rgba(96,38,158,1) 0%, rgba(0,52,149,1) 100%)',
    display: 'flex',
    height: '132px',
    justifyContent: 'flex-start', // Align items to the left
  },
};

const stackStyles: IStackStyles = {
  root: {
    display: 'flex',
    justifyContent: 'flex-start', // Align items to the left
  },
};

const stackItemStyles: IStackItemStyles = {
  root: {
    alignItems: 'center',
    color: DefaultPalette.white,
    display: 'flex',
    height: 50,
    justifyContent: 'flex-start', // Align items to the left
  },
};

const thirdStackItemStyles: IStackItemStyles = {
  root: {
    alignItems: 'center',
    color: DefaultPalette.white,
    display: 'flex',
    height: 50,
    justifyContent: 'flex-end', // Align items to the right
  },
};

const stackTokens: IStackTokens = {
  childrenGap: 5,
  padding: 5,
};

const appstackItemStyles: IStackItemStyles = {
  root: {
    alignItems: 'center',
    color: DefaultPalette.white,
    display: 'flex',
    height: 132,
    justifyContent: 'center',
    width: '50%',
    textAlign: 'center'
  },
};

export interface IAppPanelState {
  showPanel: boolean;
  showEditDialog: boolean;
  apps: IAppItem[];
  selectedApps: IAppItem[];
  userPreferences: string; // Serialize user preferences as JSON string
  searchText: string;
  catalogApps: IAppItem[]; // Add this to store apps from the app catalog
  viewType: 'list' | 'grid';
}

export default class AppPanel extends React.Component<IAppPanelProps, IAppPanelState> {
  constructor(props: IAppPanelProps) {
    super(props);

    this.state = {
      searchText: "",
      showPanel: false,
      showEditDialog: false,
      apps: [],
      selectedApps: [],
      userPreferences: "", // Initial state
      catalogApps: [],
      viewType: 'list', // default view
    };
  }

  componentDidMount() {
    this.fetchUserPreferences();
    this.fetchDefaultApps(); // Fetch catalog apps separately
  }

  fetchDefaultApps = async () => {
    const url = `${API_URLS.BASE_URL}/_api/web/lists/getbytitle('BioWeb Applications')/items?select=Title,Icon,Link`;
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'credentials': 'include'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      this.setState({ catalogApps: result.d.results });
    } catch (error) {
      console.error("Error fetching apps from catalog:", error);
    }
  };

  private fetchApps = async (): Promise<void> => {
    const listUrl = `${API_URLS.BASE_URL}/_api/web/lists/getbytitle('BioWeb Applications')/items?$select=Title,Icon,Link`;

    try {
      const response = await fetch(listUrl, {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error(`Failed to fetch apps: ${response.statusText}`);

      const result = await response.json();
      const apps = result.d.results;

      this.setState({ apps });

      if (!this.state.userPreferences) {
        // If no user preferences, show default apps
        this.fetchDefaultApps();
      } else {
        // User preferences exist, parse and set selectedApps from userPreferences
        this.setState({ selectedApps: JSON.parse(this.state.userPreferences) });
      }
    } catch (error) {
      console.error("Error fetching apps:", error);
    }
  }

  getCurrentUserId = async () => {
    const url = `${API_URLS.BASE_URL}/_api/web/currentUser`;
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'credentials': 'include'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      return data.d.Id;
    } catch (error) {
      console.error("Error fetching current user ID:", error);
      return -1;
    }
  };

  private fetchUserPreferences = async (): Promise<void> => {
    const userId = await this.getCurrentUserId();
    if (userId === -1) {
      this.fetchDefaultApps(); // Fetch default apps if unable to obtain valid user ID
      return;
    }

    const listUrl = `${API_URLS.BASE_URL}/_api/web/lists/getbytitle('BioWeb Applications - User Preferences')/items?$filter=UserIdId eq ${userId}&$select=Preferences,ViewType`;

    try {
      const response = await fetch(listUrl, {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error(`Failed to fetch user preferences: ${response.statusText}`);

      const result = await response.json();
      const items = result.d.results;

      if (items.length > 0) {
        const userPreferences = items[0].Preferences ? JSON.parse(items[0].Preferences) : [];
        const viewType = items[0].ViewType || 'list'; // Default to 'list' if ViewType is not set
        this.setState({ userPreferences: items[0].Preferences, selectedApps: userPreferences, viewType }, this.fetchApps);
      } else {
        this.fetchDefaultApps(); // Fetch default apps if no user preferences
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      this.fetchDefaultApps(); // Fetch default apps as a fallback
    }
  };

  saveUserPreferences = async (): Promise<void> => {
    const userId = await this.getCurrentUserId();
    if (userId === -1) {
      console.error("Invalid user ID");
      return;
    }

    const digestUrl = `${API_URLS.BASE_URL}/_api/contextinfo`;
    const digestResponse = await fetch(digestUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose'
      },
      credentials: 'include'
    });

    if (!digestResponse.ok) {
      console.error("Failed to fetch request digest");
      return;
    }

    const digestResult = await digestResponse.json();
    const requestDigest = digestResult.d.GetContextWebInformation.FormDigestValue;

    const preferencesToSave = JSON.stringify(this.state.selectedApps);
    const viewTypeToSave = this.state.viewType;
    const listUrl = `${API_URLS.BASE_URL}/_api/web/lists/getbytitle('BioWeb Applications - User Preferences')/items?$filter=UserIdId eq ${userId}`;

    const existingItemsResponse = await fetch(listUrl, {
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose'
      },
      credentials: 'include'
    });

    if (!existingItemsResponse.ok) {
      console.error("Error checking existing preferences");
      return;
    }

    const existingItems = await existingItemsResponse.json();
    if (existingItems.d.results.length > 0) {
      const itemId = existingItems.d.results[0].Id;
      const updateUrl = `${API_URLS.BASE_URL}/_api/web/lists/getbytitle('BioWeb Applications - User Preferences')/items(${itemId})`;
      const updateResponse = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'X-RequestDigest': requestDigest,
          'IF-MATCH': '*',
          'X-HTTP-Method': 'MERGE'
        },
        body: JSON.stringify({
          Preferences: preferencesToSave,
          ViewType: viewTypeToSave,
          "__metadata": { "type": "SP.Data.BioWeb_x0020_Applications_x0020__x0020_User_x0020_PreferencesListItem" }
        }),
        credentials: 'include'
      });

      if (!updateResponse.ok) {
        console.error("Failed to update user preferences:", updateResponse.statusText);
        return;
      }
      console.log("Preferences updated successfully.");
    } else {
      const addUrl = `${API_URLS.BASE_URL}/_api/web/lists/getbytitle('BioWeb Applications - User Preferences')/items`;
      const addResponse = await fetch(addUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'X-RequestDigest': requestDigest
        },
        body: JSON.stringify({
          UserIdId: userId,
          Preferences: preferencesToSave,
          ViewType: viewTypeToSave,
          "__metadata": { "type": "SP.Data.BioWeb_x0020_Applications_x0020__x0020_User_x0020_PreferencesListItem" }
        }),
        credentials: 'include'
      });

      if (!addResponse.ok) {
        console.error("Failed to add new user preferences:", addResponse.statusText);
        return;
      }
      console.log("Preferences saved successfully.");
    }
  };

  onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const apps = Array.from(this.state.selectedApps);
    const [reorderedApp] = apps.splice(source.index, 1);
    apps.splice(destination.index, 0, reorderedApp);

    this.setState({
      selectedApps: apps,
    }, this.saveUserPreferences);
  };

  private _togglePanel = (): void => {
    this.setState(prevState => ({
      showPanel: !prevState.showPanel,
      showEditDialog: false  // Reset edit mode state when toggling the panel visibility
    }));
  };

  private _toggleEditMode = (): void => {
    this.setState(prevState => ({
      showEditDialog: !prevState.showEditDialog,
    }));
  };

  toggleAppSelection = (app: IAppItem, add: boolean) => {
    if (add) {
      this.setState(prevState => ({
        selectedApps: [...prevState.selectedApps, app]
      }), this.saveUserPreferences);
    } else {
      this.setState(prevState => ({
        selectedApps: prevState.selectedApps.filter(selectedApp => selectedApp.Title !== app.Title)
      }), this.saveUserPreferences);
    }
  };

  private _closePanel = (): void => {
    this.setState({
      showPanel: false,
      showEditDialog: false,  // Ensure edit mode is turned off when panel is explicitly closed
      searchText: '',
    });
  };

  private onSearch = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    this.setState({
      searchText: newValue || '',
    });
  };

  private setViewType = (viewType: 'list' | 'grid') => {
    this.setState({ viewType }, this.saveUserPreferences);
  };

  renderAppItem = (app: IAppItem, index: number, isGridView: boolean) => {
    const isAppSelected = this.state.selectedApps.some(selectedApp => selectedApp.Title === app.Title);
    const iconToShow = isAppSelected ? 'delete' : 'Add';
    const onClickAction = () => this.toggleAppSelection(app, !isAppSelected);
    const itemClass = isGridView ? styles.appItemGrid : styles.appItemList;
    const targetValue: any = app.OpenInNewTab === true ? "_blank" : "_self";
    const interceptionValue = app.OpenInNewTab === true ? "off" : "on";
    return (
      <div className={itemClass} key={app.Title}>
        <Stack horizontal styles={stackStyles} tokens={stackTokens}>
          <Stack.Item grow={0} styles={stackItemStyles}>
            <IconButton
              iconProps={{ iconName: app.Icon }}
              title={app.Title}
              ariaLabel={app.Title}
              onClick={() => {/* Define your click handler function here */ }}
              className={styles['app-icon']}
              styles={{
                root: {
                  color: '#212121',
                  cursor: 'pointer',
                  width: 48,
                  height: 48,
                  fontSize: 20,
                  backgroundColor: '#F3F6F9',
                  padding: '5px',
                  marginRight: '10px',
                  selectors: {
                    '& .ms-Button-icon:hover': {
                      backgroundColor: '#e4ecf5',
                    },
                  }
                }
              }}
            />
          </Stack.Item>
          <Stack.Item grow={4} styles={stackItemStyles}>
            <a href={app.Link.Url}
              target={targetValue}
              data-interception={interceptionValue} style={{ cursor: 'pointer', textDecoration: 'none' }}><span className="app-name" style={{ color: '#3C3C3C' }}>{app.Title}</span></a>
          </Stack.Item>
          <Stack.Item grow={1} styles={thirdStackItemStyles}>
            {this.state.showEditDialog && (
              <IconButton
                iconProps={{ iconName: iconToShow }}
                title={iconToShow === 'Add' ? "Add to Preferences" : "Remove from Preferences"}
                ariaLabel={iconToShow === 'Add' ? "Add to Preferences" : "Remove from Preferences"}
                onClick={onClickAction}
                className={iconToShow === 'Add' ? styles.Add : styles.deleteAppBtn}
                styles={{
                  root: {
                    color: iconToShow === 'delete' ? 'red' : 'black',
                    cursor: 'pointer',
                    width: 91,
                    height: 40,
                    border: '1px solid #DCDCDC',
                    backgroundColor: '#fff',
                    padding: '5px',
                    selectors: {
                      '& .ms-Button-icon:hover, .ms-Button:hover': {
                        backgroundColor: '#faf8f8',
                      },
                    }
                  }
                }}
              />
            )}
          </Stack.Item>
        </Stack>
      </div>
    );
  };

  render(): React.ReactElement<IAppPanelProps> {
    const { showPanel, showEditDialog, searchText, selectedApps, catalogApps, viewType } = this.state;
    let contentToShow: JSX.Element | JSX.Element[];
    let buttonText = showEditDialog ? "Save" : "Edit my applications";

    if (showEditDialog) {
      const filteredCatalogApps = catalogApps.filter(app => app.Title.toLowerCase().includes(searchText.toLowerCase()));
      const filteredSelectedApps = selectedApps.filter(app => app.Title.toLowerCase().includes(searchText.toLowerCase()));

      const selectedAppsContent = filteredSelectedApps.map((app, index) => this.renderAppItem(app, index, viewType === 'grid'));
      const nonSelectedApps = filteredCatalogApps.filter(app => !selectedApps.some(selectedApp => selectedApp.Title === app.Title));
      const nonSelectedAppsContent = nonSelectedApps.map((app, index) => this.renderAppItem(app, index, viewType === 'grid'));

      contentToShow = (
        <>
          {selectedAppsContent.length > 0 && <div style={{ marginBottom: '20px' }}>
            <h3>Selected applications</h3>
            {selectedAppsContent}
          </div>}
          {nonSelectedAppsContent.length > 0 && <div>
            <h3>Available applications</h3>
            {nonSelectedAppsContent}
          </div>}
        </>
      );
    } else if (selectedApps.length === 0) {
      contentToShow = (
        <Stack horizontal styles={appstackStyles}>
          <Stack.Item grow={3} styles={appstackItemStyles}>
            <p style={{ fontSize: '14px', padding: '20px 30px' }}>You have not added<br></br>
              any applications yet</p>
          </Stack.Item>
          <Stack.Item grow={3} styles={appstackItemStyles}>
            <img src={require('../common/img/appicon.png')} alt="app icon" style={{ marginTop: 'auto' }} />
          </Stack.Item>
        </Stack>
      );
      buttonText = "Add application";
    } else {
      contentToShow = selectedApps.map((app, index) => this.renderAppItem(app, index, viewType === 'grid'));
    }

    return (
      <>
        <div title="Open Apps" style={{ cursor: 'pointer' }}>
          <Grid16Regular title='Open App Panel' style={{ height: '30px', width: '30px', marginRight: '1px', cursor: 'pointer' }} onClick={this._togglePanel} />
        </div>
        <Panel
          isOpen={showPanel}
          type={PanelType.medium}
          onDismiss={this._closePanel}
          closeButtonAriaLabel="Close"
          headerText="Applications"
          className={styles.apppanel}
        >
          {(selectedApps.length != 0 || showEditDialog) && <div className={styles.viewtogglebuttons} style={{ textAlign: 'right' }}>
            <span title="Grid View" style={{ cursor: 'pointer' }}>
              <GridDots20Regular
                title='Grid view'
                style={{ height: '30px', width: '30px', marginRight: '15px', cursor: 'pointer', color: '#ccc' }}
                onClick={() => this.setViewType('grid')}
                className={viewType === 'grid' ? styles.selectedView : ''}
              />
            </span>
            <span title="List View" style={{ cursor: 'pointer' }}>
              <TextBulletList20Regular
                title='List view'
                style={{ height: '30px', width: '30px', marginRight: '0', cursor: 'pointer', color: '#ccc' }}
                onClick={() => this.setViewType('list')}
                className={viewType === 'list' ? styles.selectedView : ''}
              />
            </span>
          </div>}
          {showEditDialog && (
            <TextField
              className={styles.appsearchbox}
              placeholder="Search an application..."
              onChange={this.onSearch}
              value={searchText}
              underlined={true}
            />
          )}

          {!showEditDialog && <div className={styles['app-list'] + `${this.state.viewType === 'grid' ? styles.appitemsgrid : ''}`} style={{ marginBottom: '18px', paddingBottom: '12px' }}>
            <div className={styles['app-list'] + `${viewType === 'grid' ? styles.appitemsgrid : ''}`}>
              <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={viewType === 'grid' ? 'app-grid' : 'app-list'}>
                      {selectedApps.map((app, index) => (
                        <Draggable key={app.Title} draggableId={app.Title} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              {this.renderAppItem(app, index, viewType === 'grid')}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>}
          {(showEditDialog || selectedApps.length === 0) && <div className={styles['app-list'] + `${this.state.viewType === 'grid' ? styles.appitemsgrid : ''}`} style={{ borderBottom: '1px solid #ccc', marginBottom: '18px' }}>
            {contentToShow}
          </div>}
          <PrimaryButton
            text={buttonText}
            onClick={this._toggleEditMode}
            className={styles.panelappbutton}
            styles={{
              root: { marginLeft: '5px', float: 'right' } // Apply margin-left of 10px
            }}
          />
        </Panel>
      </>
    );
  }
}