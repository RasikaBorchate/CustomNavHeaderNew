import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/items/get-all";
import "@pnp/sp/site-scripts";
import "@pnp/sp/site-designs";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/batching";
import "@pnp/sp/regional-settings/web";
import "@pnp/sp/fields";
interface IList {
    Title: string;
}

interface ISubaction {
    verb: string;
    description?: string;
    title?: string;
    schemaXml?: string;
    targetListName?: string;
    name?: string;
    viewFields?: string[];
    query?: string;
    rowLimit?: number;
    isPaged?: boolean;
    makeDefault?: boolean;
}

interface IListCreationAction {
    verb: string;
    listName: string;
    templateType: number;
    subactions: ISubaction[];
}
interface ISiteScript {
    "$schema": string;
    "actions": IListCreationAction[];
    "bindata": {};
    "version": string;
}


const PnpSpCommonServices = {
    _getSiteLists: async (sp: any) => {
        return await sp.web.lists();
    },
    _getSiteListByName: async (context: any, listName: string) => {
        var myHeaders = new Headers({
            'Accept': 'application/json; odata=verbose'
        });

        var myInit = {
            method: 'GET',
            headers: myHeaders,
        }

        return await fetch(context.pageContext.legacyPageContext.webAbsoluteUrl + "/_api/web/lists/getByTitle('" + listName + "')", myInit).then((response) => {
            return response;
        });
    },
    _getSiteScript: async (sp: any) => {
        return await sp.siteScripts.getSiteScripts();
    },
    _getSiteDesign: async (sp: any) => {
        return await sp.siteDesigns.getSiteDesigns();
    },


    _createSiteScript: async (sp: any) => {
        const neededLists = [
            // Help Links
            {
                "verb": "createSPList",
                "listName": "Help Links",
                "templateType": 100,
                "subactions": [
                    {
                        "verb": "setDescription",
                        "description": "This list contains Help Links."
                    },
                    {
                        "verb": "setTitle",
                        "title": "Help Links"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"URL\" ID=\"{1b43d0e7-4499-44fd-8752-07398956aa80}\" Name=\"link\" DisplayName=\"Link\" Required=\"False\" Format=\"Hyperlink\" StaticName=\"link\" Group=\"_CH\" Customization=\"\" />"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Name=\"Order\" FromBaseType=\"FALSE\" Type=\"Number\" DisplayName=\"Order\" Required=\"FALSE\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\" ID=\"{adc2f7dc-c290-46d3-a95c-cb1bc20f7729}\" StaticName=\"Order\" Group=\"_CH\"/>"
                    },
                    {
                        "verb": "addSPView",
                        "name": "All Items",
                        "viewFields": [
                            "LinkTitle",
                            "link",
                            "Order"
                        ],
                        "query": "",
                        "rowLimit": 30,
                        "isPaged": true,
                        "makeDefault": true
                    }
                ]
            },
            // BioWeb Applications
            {
                "verb": "createSPList",
                "listName": "BioWeb Applications",
                "templateType": 100,
                "subactions": [
                    {
                        "verb": "setDescription",
                        "description": "This list contains BioWeb Applications."
                    },
                    {
                        "verb": "setTitle",
                        "title": "BioWeb Applications"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"Text\" ID=\"{3de64da7-8d45-48e1-9d74-f568a50a61db}\" Name=\"Icon\" DisplayName=\"Icon\" Required=\"TRUE\" StaticName=\"Icon\" Group=\"_CH\" Customization=\"\" />"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"URL\" ID=\"{120cdaba-63b2-4050-91fe-0fc2c68466f1}\" Name=\"Link\" DisplayName=\"Link\" Required=\"TRUE\" Format=\"Hyperlink\" StaticName=\"Link\" Group=\"_CH\" Customization=\"\" />"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"Boolean\" ID=\"{5aeaff1f-a0b2-4966-95ec-f933d36997bc}\" DisplayName=\"Open in New Tab\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\"  Group=\"_CH\"  StaticName=\"OpenInNewTab\" Name=\"OpenInNewTab\"><Default>0</Default></Field>"
                    },
                    {
                        "verb": "addSPView",
                        "name": "All Items",
                        "viewFields": [
                            "LinkTitle",
                            "Icon",
                            "Link",
                            "OpenInNewTab"
                        ],
                        "query": "",
                        "rowLimit": 30,
                        "isPaged": true,
                        "makeDefault": true
                    }
                ]
            },
            // BioWeb Applications - User Preferences
            {
                "verb": "createSPList",
                "listName": "BioWeb Applications - User Preferences",
                "templateType": 100,
                "subactions": [
                    {
                        "verb": "setDescription",
                        "description": "This list contains Type Of BioWeb Applications - User Preferences."
                    },
                    {
                        "verb": "setTitle",
                        "title": "BioWeb Applications - User Preferences"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"User\" ID=\"{f9c0814f-be16-49e1-a151-9f1e56590154}\" Group=\"_CH\" DisplayName=\"UserId\" Required=\"FALSE\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\" MaxLength=\"255\"  StaticName=\"UserId\" Name=\"UserId\" />"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"Note\" ID=\"{1d2c2444-85ca-4b52-ab10-3263d824ad5d}\" Group=\"_CH\" DisplayName=\"Preferences\" Required=\"FALSE\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\" NumLines=\"6\" RichText=\"FALSE\" IsolateStyles=\"TRUE\" Sortable=\"FALSE\" StaticName=\"Preferences\" Name=\"Preferences\" />"
                    },
                    {
                        "verb": "addSPView",
                        "name": "All Items",
                        "viewFields": [
                            "LinkTitle",
                            "UserId",
                            "Preferences"
                        ],
                        "query": "",
                        "rowLimit": 30,
                        "isPaged": true,
                        "makeDefault": true
                    }
                ]
            },
            //Alert Icon 
            {
                "verb": "createSPList",
                "listName": "Alert Icon",
                "templateType": 100,
                "subactions": [
                    {
                        "verb": "setDescription",
                        "description": "This list contains Alert Icon."
                    },
                    {
                        "verb": "setTitle",
                        "title": "Alert Icon"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"Thumbnail\" ID=\"{d1d2eba0-7caf-4674-b1b3-200cfd44ea06}\" Name=\"Icon\" DisplayName=\"Icon\" Required=\"TRUE\" StaticName=\"Icon\" Group=\"_CH\" Customization=\"\" />"
                    },
                    {
                        "verb": "addSPView",
                        "name": "All Items",
                        "viewFields": [
                            "LinkTitle",
                            "Icon"
                        ],
                        "query": "",
                        "rowLimit": 30,
                        "isPaged": true,
                        "makeDefault": true
                    }
                ]
            },
            //Alert Messages
            {
                "verb": "createSPList",
                "listName": "Alert Messages",
                "templateType": 100,
                "subactions": [
                    {
                        "verb": "setDescription",
                        "description": "This list contains Alert Messages."
                    },
                    {
                        "verb": "setTitle",
                        "title": "Alert Messages"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"URL\" ID=\"{de8d0560-a2fe-468d-b54a-57f775e728c0}\" Name=\"link\" DisplayName=\"Link\" Required=\"False\" Format=\"Hyperlink\" StaticName=\"link\" Group=\"_CH\" Customization=\"\" />"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"DateTime\" DisplayName=\"Start Date\" Required=\"TRUE\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\" Format=\"DateOnly\" FriendlyDisplayFormat=\"Disabled\" ID=\"{dfb88d58-fd3f-4866-b963-02c2a9d9da70}\" StaticName=\"StartDate\" Name=\"StartDate\" Group=\"_CH\"/>"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"DateTime\" DisplayName=\"End Date\" Required=\"TRUE\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\" Format=\"DateOnly\" FriendlyDisplayFormat=\"Disabled\" ID=\"{379c5fa9-e46f-482b-802a-afa2c73d836a}\" StaticName=\"EndDate\" Name=\"EndDate\" Group=\"_CH\"/>"
                    },
                    {
                        "verb": "addSPLookupFieldXml",
                        "schemaXml": "<Field Type=\"Lookup\" ID=\"{d0309162-c084-4c04-9246-876f7b5956d6}\"  DisplayName=\"Icon\" Group=\"_CH\" Required=\"FALSE\" EnforceUniqueValues=\"FALSE\" ShowField=\"Title\" StaticName=\"Icon\" Name=\"Icon\" />",
                        "targetListName": "Alert Icon"
                    },
                    {
                        "verb": "addSPView",
                        "name": "All Items",
                        "viewFields": [
                            "LinkTitle",
                            "link",
                            "StartDate",
                            "EndDate",
                            "Icon"
                        ],
                        "query": "",
                        "rowLimit": 30,
                        "isPaged": true,
                        "makeDefault": true
                    }
                ]
            },
            // Mega Menu Level 1
            {
                "verb": "createSPList",
                "listName": "Mega Menu Level 1",
                "templateType": 100,
                "subactions": [
                    {
                        "verb": "setDescription",
                        "description": "This list contains Mega Menu Level 1."
                    },
                    {
                        "verb": "setTitle",
                        "title": "Mega Menu Level 1"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Name=\"sortOrder\" FromBaseType=\"FALSE\" Type=\"Number\" DisplayName=\"Sort Order\" Required=\"FALSE\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\" ID=\"{498e401a-8843-4d83-ae8f-842e4bddc808}\" StaticName=\"sortOrder\" />"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"Link\" ID=\"{a3d3c8f7-f1eb-4d07-9ba5-dd5deb8180af}\" Name=\"link\" DisplayName=\"Link\" Required=\"False\" Format=\"Hyperlink\" StaticName=\"link\" Group=\"_CH\" Customization=\"\" />"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"Boolean\" ID=\"{ab27e027-b820-4ad4-bfb6-0d8ca45f1d8a}\" DisplayName=\"Open in New Tab\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\"  Group=\"_CH\"  StaticName=\"OpenInNewTab\" Name=\"OpenInNewTab\"><Default>0</Default></Field>"
                    },
                    {
                        "verb": "addSPView",
                        "name": "All Items",
                        "viewFields": [
                            "LinkTitle",
                            "sortOrder",
                            "link",
                            "OpenInNewTab"
                        ],
                        "query": "",
                        "rowLimit": 30,
                        "isPaged": true,
                        "makeDefault": true
                    }
                ]
            },
            // Mega Menu Level 2
            {
                "verb": "createSPList",
                "listName": "Mega Menu Level 2",
                "templateType": 100,
                "subactions": [
                    {
                        "verb": "setDescription",
                        "description": "This list contains Mega Menu Level 2."
                    },
                    {
                        "verb": "setTitle",
                        "title": "Mega Menu Level 2"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Name=\"sortOrder\" FromBaseType=\"FALSE\" Type=\"Number\" DisplayName=\"Sort Order\" Required=\"FALSE\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\" ID=\"{3bccebcc-66eb-4d0b-ad96-73d1915c9892}\" StaticName=\"sortOrder\" />"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"URL\" ID=\"{c225aea2-913f-49f8-86d1-21f98f2d0fc6}\" Name=\"link\" DisplayName=\"Link\" Required=\"False\" Format=\"Hyperlink\" StaticName=\"link\" Group=\"_CH\" Customization=\"\" />"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"Boolean\" ID=\"{b8b85563-7308-439c-afbb-2c08c1274a74}\" DisplayName=\"Open in New Tab\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\"  Group=\"_CH\"  StaticName=\"OpenInNewTab\" Name=\"OpenInNewTab\"><Default>0</Default></Field>"
                    },
                    {
                        "verb": "addSPLookupFieldXml",
                        "schemaXml": "<Field Type=\"Lookup\" ID=\"{4b5dbbb2-7443-4548-af93-4f2d2b4fe1f0}\"  DisplayName=\"Level 1 Item\" Group=\"_CH\" Required=\"FALSE\" EnforceUniqueValues=\"FALSE\" ShowField=\"Title\" StaticName=\"level1Item\" Name=\"level1Item\" />",
                        "targetListName": "Mega Menu Level 1"
                    },
                    {
                        "verb": "addSPView",
                        "name": "All Items",
                        "viewFields": [
                            "LinkTitle",
                            "sortOrder",
                            "link",
                            "OpenInNewTab",
                            "level1Item"
                        ],
                        "query": "",
                        "rowLimit": 30,
                        "isPaged": true,
                        "makeDefault": true
                    }
                ]
            },
            // Mega Menu Level 3
            {
                "verb": "createSPList",
                "listName": "Mega Menu Level 3",
                "templateType": 100,
                "subactions": [
                    {
                        "verb": "setDescription",
                        "description": "This list contains Mega Menu Level 3."
                    },
                    {
                        "verb": "setTitle",
                        "title": "Mega Menu Level 3"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Name=\"sortOrder\" FromBaseType=\"FALSE\" Type=\"Number\" DisplayName=\"Sort Order\" Required=\"FALSE\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\" ID=\"{f9f9389a-fc1b-4183-ad4b-d8effff83e13}\" StaticName=\"sortOrder\" />"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"URL\" ID=\"{fe30e383-8dd6-40d6-8956-11319de3e029}\" Name=\"link\" DisplayName=\"Link\" Required=\"TRUE\" Format=\"Hyperlink\" StaticName=\"link\" Group=\"_CH\" Customization=\"\" />"
                    },
                    {
                        "verb": "addSPFieldXml",
                        "schemaXml": "<Field Type=\"Boolean\" ID=\"{dea6a077-a72e-450d-bd99-84a44e7c0d8e}\" DisplayName=\"Open in New Tab\" EnforceUniqueValues=\"FALSE\" Indexed=\"FALSE\"  Group=\"_CH\"  StaticName=\"OpenInNewTab\" Name=\"OpenInNewTab\"><Default>0</Default></Field>"
                    },
                    {
                        "verb": "addSPLookupFieldXml",
                        "schemaXml": "<Field Type=\"Lookup\" ID=\"{10749683-07a8-4518-96b5-1d102793199b}\"  DisplayName=\"Level 2 Item\" Group=\"_CH\" Required=\"FALSE\" EnforceUniqueValues=\"FALSE\" ShowField=\"Title\" StaticName=\"level2Item\" Name=\"level2Item\" />",
                        "targetListName": "Mega Menu Level 2"
                    },
                    {
                        "verb": "addSPView",
                        "name": "All Items",
                        "viewFields": [
                            "LinkTitle",
                            "sortOrder",
                            "link",
                            "OpenInNewTab",
                            "level2Item"
                        ],
                        "query": "",
                        "rowLimit": 30,
                        "isPaged": true,
                        "makeDefault": true
                    }
                ]
            },
        ];

        const lists:any = await _getSiteLists(sp);
    if (!lists) {
        throw new Error("Failed to retrieve lists.");
    }
    const listNames = lists.map((list: IList) => list.Title);

    const siteScript: ISiteScript = {
        "$schema": "https://developer.microsoft.com/json-schemas/sp/site-design-script-actions.schema.json",
        "actions": [],
        "bindata": {},
        "version": "1"
    };
        neededLists.forEach(list => {
            if (!listNames.includes(list.listName)) {
                const listCreationAction = {
                    verb: "createSPList",
                    listName: list.listName,
                    templateType: list.templateType,
                    subactions: list.subactions
                };
                siteScript.actions.push(listCreationAction);
            }
        });

        if (siteScript.actions.length > 0) {
            return await sp.siteScripts.createSiteScript("CustomHeaderSiteScript", "CustomHeaderSiteScript", siteScript);
        } else {
            return { message: "All necessary lists already exist, no site script needed." };
        }
    },

    _createSiteDesign: async (sp: any, siteScriptId: any) => {
        return await sp.siteDesigns.createSiteDesign({
            SiteScriptIds: [siteScriptId],
            Title: "CustomHeaderSiteDesign",
            WebTemplate: "64",
        });
    },
    _applySiteDesignToSite: async (sp: any, siteDesignId: string, siteUrl: string) => {
        // return await sp.siteDesigns.applySiteDesign(siteDesignId, siteUrl);
        return await sp.web.addSiteDesignTask(siteDesignId);
    },
}
export default PnpSpCommonServices;
async function _getSiteLists(sp: any) {
    return await sp.web.lists();
}

