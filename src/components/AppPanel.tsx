import * as React from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { DefaultPalette, Icon, IconButton, IStackItemStyles, IStackStyles, IStackTokens, PrimaryButton, Stack, TextField, TooltipHost } from 'office-ui-fabric-react';
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
  Default: any;
  OpenInNewTab: any;
  ID:any;
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

const secondStackItemStyles: IStackItemStyles = {
  root: {
    alignItems: 'center',
    color: DefaultPalette.white,
    display: 'flex',
    minHeight: 50,
    justifyContent: 'flex-start', // Align items to the left
  },
};
const thirdStackItemStyles: IStackItemStyles = {
  root: {
    alignItems: 'center',
    color: DefaultPalette.white,
    display: 'flex',
    minHeight: 50,
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
  viewAllLink: any
  defaultCheckedApps: IAppItem[],  // Added to store default apps
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
      viewAllLink: '',
      defaultCheckedApps: [],  // Added to store default apps
    };
  }

  componentDidMount() {
    this.fetchUserPreferences();
    this.fetchDefaultApps(); // Fetch catalog apps separately
    this.fetchViewAllLink(); // Fetch the view all link when component mounts
  }
  fetchViewAllLink = async () => {
    const url = `${API_URLS.BASE_URL}/_api/web/lists/getbytitle('BioWeb Config')/items?$select=Title,Value`;
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
      const items = result.d.results;
      const viewAllItem = items.find((item: any) => item.Title === 'ViewAllUrl');

      if (viewAllItem) {
        this.setState({ viewAllLink: viewAllItem.Value });
      } else {
        console.error("No 'ViewAllUrl' item found in the BioWeb Config list");
      }
    } catch (error) {
      console.error("Error fetching the view all link:", error);
    }
  };

  fetchDefaultApps = async () => {
    const url = `https://bmrn.sharepoint.com/sites/bioweb-home/_api/web/lists/getbytitle('BioWeb Applications')/items?$orderBy=Title asc&$select=Title,Icon,Link,Default,OpenInNewTab,ID`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
        'credentials': 'include'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch');
    const result = await response.json();
    const defaultCheckedApps = result.d.results.filter((app: any) => app.Default === true);
    this.setState({ catalogApps: result.d.results, defaultCheckedApps });
  };

  fetchUserPreferences = async () => {
    const userId = await this.getCurrentUserId();
    if (userId === -1) {
      console.error("Invalid user ID");
      return;
    }

    const listUrl = `https://bmrn.sharepoint.com/sites/bioweb-home/_api/web/lists/getbytitle('BioWeb Applications - User Preferences')/items?$filter=UserIdId eq ${userId}&$select=ID,Preferences,ViewType`;
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
      if (result.d.results.length > 0) {
        const userPreferences = result.d.results[0].Preferences ? JSON.parse(result.d.results[0].Preferences) : [];
        const viewType = result.d.results[0].ViewType || 'list';

        // Validate and potentially update user preferences based on current catalog apps
        const updatedPreferences = await this.validateAndUpdatePreferences(userPreferences);

        if (JSON.stringify(userPreferences) !== JSON.stringify(updatedPreferences)) {
          // Save updated preferences if they have changed
          await this.saveUserPreferences(updatedPreferences);
        }

        this.setState({
          userPreferences: JSON.stringify(updatedPreferences),
          selectedApps: updatedPreferences,
          viewType
        }, this.fetchApps);
      } else {
        if (this.state.defaultCheckedApps.length > 0) {
          this.saveDefaultPreferences(userId);
        }
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      if (this.state.defaultCheckedApps.length > 0) {
        this.saveDefaultPreferences(userId);
      }
    }
  };
  validateAndUpdatePreferences = async (preferences: any) => {
    const appsUrl = `https://bmrn.sharepoint.com/sites/bioweb-home/_api/web/lists/getbytitle('BioWeb Applications')/items?$select=ID,Title,Link,Icon,OpenInNewTab,Default`;
    const response = await fetch(appsUrl, {
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error("Failed to fetch applications for validation:", response.statusText);
      return preferences; // If fetch fails, return original preferences
    }
    const result = await response.json();
    const validApps = result.d.results;

    // Function to extract item ID from URI
    const extractItemIdFromUri = (uri: string) => {
      const match = uri.match(/Items\((\d+)\)/);
      return match ? match[1] : null;
    };

    let isUpdated = false; // Track if any updates have been made
    const updatedPreferences = preferences.map((pref: any) => {

      // Extract ID from __metadata.uri or use pref.Id
      const prefItemId = pref.__metadata ? extractItemIdFromUri(pref.__metadata.uri) : pref.ID.toString();
      console.log(`Checking preference ID: ${prefItemId}`); // Debug log

      // Find the application that matches the preference ID
      const foundApp = validApps.find((app: any) => app.Id.toString() === prefItemId);
      let needsUpdate = false;
      if (foundApp) {

        let updatedPref = { ...pref };

        // Compare each property
        if (pref.Title !== foundApp.Title) {
          updatedPref.Title = foundApp.Title;
          needsUpdate = true;
        }
        if (!pref.Link || pref.Link.Url !== foundApp.Link.Url) {
          updatedPref.Link = { Url: foundApp.Link.Url }; // Assuming Link is an object with Url property
          needsUpdate = true;
        }
        if (pref.OpenInNewTab !== foundApp.OpenInNewTab) {
          updatedPref.OpenInNewTab = foundApp.OpenInNewTab;
          needsUpdate = true;
        }
        if (pref.Icon !== foundApp.Icon) {
          updatedPref.Icon = foundApp.Icon;
          needsUpdate = true;
        }
        if (pref.Default !== foundApp.Default) {
          updatedPref.Default = foundApp.Default;
          needsUpdate = true;
        }
        if (needsUpdate) {
          console.log(`Updating preference with ID: ${prefItemId}`); // Debug log
          isUpdated = true;
          return updatedPref;
        }

        return pref; // Return as is if no updates needed
      } else {
        isUpdated = true;
        console.log(`No matching app found for preference with ID: ${prefItemId}`); // Debug log
        return null; // No app found, mark for deletion
      }
    }).filter((pref: any) => pref !== null); // Remove null entries (deleted items)

    // Return updated preferences if changes were detected, else return original
    return isUpdated ? updatedPreferences : preferences;
  };

  saveDefaultPreferences = async (userId: any) => {
    const preferencesToSave = JSON.stringify(this.state.defaultCheckedApps);
    const viewTypeToSave = 'list'; // default viewType for new users

    const addUrl = `${API_URLS.BASE_URL}/_api/web/lists/getbytitle('BioWeb Applications - User Preferences')/items`;
    const digestResponse = await fetch(`${API_URLS.BASE_URL}/_api/contextinfo`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose'
      },
      credentials: 'include'
    });
    const digestResult = await digestResponse.json();
    const requestDigest = digestResult.d.GetContextWebInformation.FormDigestValue;

    const response = await fetch(addUrl, {
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

    if (!response.ok) {
      console.error("Failed to save default user preferences:", response.statusText);
      return;
    }
    console.log("Default preferences saved successfully.");
    this.setState({ userPreferences: preferencesToSave, selectedApps: this.state.defaultCheckedApps, viewType: viewTypeToSave });
  };



  private fetchApps = async (): Promise<void> => {
    const listUrl = `https://bmrn.sharepoint.com/sites/bioweb-home/_api/web/lists/getbytitle('BioWeb Applications')/items?$orderBy=Title asc&$select=Title,Icon,Link,Default,OpenInNewTab,ID`;

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
  getCurrentUserId = async (): Promise<number> => {
     const url = `https://bmrn.sharepoint.com/sites/bioweb-home/_api/web/currentUser`;
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

 
  saveUserPreferences = async (selectedPreferencesToSave: any): Promise<void> => {
    const userId = await this.getCurrentUserId();
    
    if (userId === -1) {
      console.error("Invalid user ID");
      return;
    }

    // Fetch request digest for updates or additions
    const digestUrl = `https://bmrn.sharepoint.com/sites/bioweb-home/_api/contextinfo`;
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

    // Validate and potentially update local preferences before saving

    let preferencesToSave = JSON.stringify(selectedPreferencesToSave);
    const viewTypeToSave = this.state.viewType;

    // Check if user preferences already exist
    const listUrl = `https://bmrn.sharepoint.com/sites/bioweb-home/_api/web/lists/getbytitle('BioWeb Applications - User Preferences')/items?$filter=UserIdId eq ${userId}`;
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
      // Update existing preferences
      const itemId = existingItems.d.results[0].Id;
      const updateUrl = `https://bmrn.sharepoint.com/sites/bioweb-home/_api/web/lists/getbytitle('BioWeb Applications - User Preferences')/items(${itemId})`;
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
      // Add new preferences
      const addUrl = `https://bmrn.sharepoint.com/sites/bioweb-home/_api/web/lists/getbytitle('BioWeb Applications - User Preferences')/items`;
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
      selectedApps: apps
    },() => {
      this.saveUserPreferences(this.state.selectedApps);
    });
   
  };

  private _togglePanel = (): void => {
    this.setState(prevState => ({
      showPanel: !prevState.showPanel,
      showEditDialog: false  // Reset edit mode state when toggling the panel visibility
    }));
  };

  private _toggleEditMode = (): void => {
    if (this.state.showEditDialog) {
      this.saveUserPreferences(this.state.selectedApps);
    }
    this.setState(prevState => ({
      showEditDialog: !prevState.showEditDialog,
    }));
  };

  toggleAppSelection = (app: IAppItem, add: boolean) => {
    if (add) {
      this.setState(prevState => ({
        selectedApps: [...prevState.selectedApps, app]
      }));
    } else {
      this.setState(prevState => ({
        selectedApps: prevState.selectedApps.filter(selectedApp => selectedApp.Title !== app.Title)
      }));
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
    this.setState({ viewType }, () => {
      this.saveUserPreferences(this.state.selectedApps);
    });

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
          <Stack.Item grow={4} styles={secondStackItemStyles}>
            <a href={app.Link ? app.Link.Url : ''}
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
    const { showPanel, showEditDialog, searchText, selectedApps, catalogApps, viewType, defaultCheckedApps } = this.state;
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

      if (defaultCheckedApps.length > 0) {
        contentToShow = defaultCheckedApps.map((app, index) => this.renderAppItem(app, index, viewType === 'grid'));

      }
      else {
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

      }
      buttonText = "Add application";
    }
    else {
      contentToShow = selectedApps.map((app, index) => this.renderAppItem(app, index, viewType === 'grid'));
    }

    return (
      <>
        <TooltipHost content="My Apps">
          <div style={{ cursor: 'pointer' }}>
            <Grid16Regular title='Open App Panel' style={{ height: '30px', width: '30px', marginRight: '1px', cursor: 'pointer' }} onClick={this._togglePanel} />
          </div>
        </TooltipHost>
        <Panel
          isOpen={showPanel}
          type={PanelType.medium}
          onDismiss={this._closePanel}
          closeButtonAriaLabel="Close"
          headerText="Applications"
         
        >
          {(selectedApps.length != 0 || catalogApps.length != 0 || showEditDialog) && <div className={styles.viewtogglebuttons} style={{ textAlign: 'right' }}>
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

          {(!showEditDialog && selectedApps.length > 0) && <div className={styles['app-list'] + ` ${this.state.viewType === 'grid' ? styles.appitemsgrid : ''}`} style={{ marginBottom: '18px', paddingBottom: '12px' }}>
            <div className={styles['app-list'] + ` ${viewType === 'grid' ? styles.appitemsgrid : ''}`}>
              <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={viewType === 'grid' ? 'app-grid' : 'app-list'}>
                      {selectedApps.map((app, index) => (
                        <Draggable key={app.Title} draggableId={app.Title} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps} // Apply draggableProps to the container

                            >
                              <div className={styles.dragHandle} {...provided.dragHandleProps}>
                                {/* Drag handle area could just be an icon or a small part of the item */}
                                <TooltipHost content={`Drag ${app.Title}`}><Icon iconName='GripperDotsVertical' aria-label='Drag the app' className={styles.dragIconStyle} /></TooltipHost> {this.renderAppItem(app, index, viewType === 'grid')}
                              </div>

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
          {(showEditDialog || selectedApps.length === 0) && <div className={styles['app-list'] + ` ${this.state.viewType === 'grid' ? styles.appitemsgrid : ''}`} style={{ borderBottom: '1px solid #ccc', marginBottom: '18px' }}>
            {contentToShow}
          </div>}
          <div>
            {this.state.viewAllLink && (
              <a href={this.state.viewAllLink} target="_blank" data-interception="off" className={styles.viewAllApplicationLink}>View all applications</a>
            )}
            <PrimaryButton
              text={buttonText}
              onClick={this._toggleEditMode}
              className={styles.panelappbutton}
             
            />
          </div>
        </Panel>
      </>
    );
  }
}