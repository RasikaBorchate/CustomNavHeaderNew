import { ServiceKey } from "@microsoft/sp-core-library";
import { PageContext } from "@microsoft/sp-page-context";
import { spfi, SPFI, SPFx as spSPFx } from "@pnp/sp";
import "@pnp/common";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/views";
import "@pnp/sp/attachments";
import "@pnp/sp/items";
import "@pnp/sp/site-groups/web";
import "@pnp/sp/batching";
import "@pnp/sp/items/get-all";
import "@pnp/sp/fields";
import "@pnp/sp/sputilities";
import "@pnp/sp/presets/all"
import "@pnp/sp/comments/item";
// import { ICamlQuery } from "@pnp/sp/lists";
import { IItems } from "@pnp/sp/items";
import { PermissionKind } from "@pnp/sp/security";
import { IViewInfo } from "@pnp/sp/views";
interface IDataService {
    _sp: SPFI;
    getListData(listName: string, columns?: string, expand?: string, filter?: string, isListId?: boolean): Promise<any[]>;
    getListDataById(listName: string, id: number): Promise<any>;
    updateBulkData(listName: string, data: any[]): Promise<any>;
    deleteData(list: string, isListId: boolean, ids: number[]): Promise<boolean>;
    getUsers(username: string): Promise<any>;
    getUserOrGroupInfo(userID: number): Promise<any>;
    // Define the isUserId helper function
    isUserId(id: number): Promise<boolean>;
    sendEmail(to: string[], cc: string[], subject?: string, bodyContent?: string): Promise<any>;
    createData(listName: string, data: any[]): Promise<any[]>;
    getMultipleListData(listName: string[]): Promise<any[]>;

    getListNameById(id: string): Promise<string>;
   
    getComments(listId: string, itemId: number): Promise<any[]>;
    isUserHavingPermission(permissionKind: PermissionKind): Promise<boolean>;
  
    delay(ms: any): Promise<void>;
    getCurrentUserSiteGroups(): Promise<any[]>;
    getGroupMembers(groupId: number): Promise<string[]>;
    // getListDataByCAMLQuery(camlQuery: ICamlQuery): Promise<any[]>;
    getAllListsInCurrentSite(): Promise<any[]>;
    sleep(ms: number): Promise<any>;
}
export interface TypedHash<T> {
    [key: string]: T;
}

export interface EmailProperties {

    To: string[];
    CC?: string[];
    BCC?: string[];
    Subject: string;
    Body: string;
    AdditionalHeaders?: TypedHash<string>;
    From?: string;
}

export default class DataService implements IDataService {
    public static readonly serviceKey: ServiceKey<IDataService> = ServiceKey.create<IDataService>('ds', DataService);
    _sp: SPFI;

    constructor(serviceScope: any) {
        serviceScope.whenFinished(() => {
            const pageContext = serviceScope.consume(PageContext.serviceKey);
            this._sp = spfi().using(spSPFx({
                pageContext
            }));
        });
      
    }

    public async getAllListsInCurrentSite() {
        return new Promise<any[]>(async (resolve) => {
            resolve(this._sp.web.lists.select()())
        });
    }

    // public async getListDataByCAMLQuery(camlQuery: ICamlQuery): Promise<any[]>{
    //     return new Promise<any[]>(async(resolve) =>{
    //     });
    // }

    // Define the getUserOrGroupInfo function
    public async getUserOrGroupInfo(id: number): Promise<any> {
        try {
            // Check if it's a user
            const isUser = await this.isUserId(id);

            if (isUser) {
                const userInfo = await this._sp.web.siteUsers.getById(id)();
                return userInfo;
            } else {
                const groupInfo = await this._sp.web.siteGroups.getById(id)();
                return groupInfo;
            }
        } catch (error) {
            console.error("An error occurred while fetching user or group information:", error);
            return null;
        }
    }
    // Define the isUserId helper function
    public async isUserId(id: number): Promise<boolean> {
        try {
            const user = await this._sp.web.siteUsers.getById(id).select("Id")();
            return !!user;
        } catch (error) {
            return false;
        }
    }
    public getListIdByPropertyName(propertyKeyValue: any[]): Promise<any[]> {
        return new Promise<any[]>(resolve => {
            if (propertyKeyValue) {
                let _filter = propertyKeyValue.map((prop: any) => { return prop.propertyName + " eq '" + prop.propertyValue + "'" })
                this._sp.web.lists.filter(_filter.join(" or "))().then((result: any[]) => {
                    if (result && result.length > 0) {
                        let _lists = result.map(r => {
                            return { "EntityTypeName": r.EntityTypeName, "Id": r.Id, "Title": r.Title }
                        });
                        resolve(_lists);
                    }
                    else
                        resolve([]);
                })
            }
            else
                resolve([]);
        })
    }

    public getListData(listName: string, columns?: string, expand?: string, filter?: string, isListId?: boolean): Promise<any[]> {

        let _items: IItems;
        if (isListId)
            _items = this._sp.web.lists.getById(listName).items;
        else
            _items = this._sp.web.lists.getByTitle(listName).items;

        if (expand) {
            _items = _items.expand(expand);
        }
        if (columns) {
            _items = _items.select(columns);
        }
        if (filter) {
            _items = _items.filter(filter);
        }


        return new Promise<any>((resolve) => {
            return _items.getAll().then(data => {
                resolve(data);
            });
        });
    }

    public getListNameById(id: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this._sp.web.lists.getById(id).select("Title")().then((data: any) => {
                const listName = data.Title;
                resolve(listName);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public deleteData(list: string, isListId: boolean, ids: number[]): Promise<boolean> {
        const [batchedSP, execute] = this._sp.batched();
        let _list = isListId ? batchedSP.web.lists.getById(list) : batchedSP.web.lists.getByTitle(list);

        ids.map(id => {
            _list.items.getById(id).delete();
        })

        // Executes the batched calls
        return new Promise<boolean>(async (resolve) => {
            await execute();
            resolve(true)
        });

    }

    public getListDataById(listName: string, id: number): Promise<any> {
        return new Promise((resolve) => {
            return this._sp.web.lists.getById(listName).items.select("*").filter(`ID eq ${id}`).getAll().then((data: any) => resolve(data));
        })
    }

    public async createData(listName: string, data: any[]): Promise<any[]> {
        const [batchedSP, execute] = this._sp.batched();
        const list = batchedSP.web.lists.getById(listName);
        let res: any[] = [];
        data.map(d => {
            list.items.add(d).then((b: any) => {
                // console.log(b);
                res.push(b);
            });
        })

        // Executes the batched calls
        return new Promise<any[]>(async (resolve) => {
            await execute();
            resolve(res)
        });
    }

    public async updateBulkData(listName: string, data: any[]): Promise<any> {
        const [batchedSP, execute] = this._sp.batched();
        const list = batchedSP.web.lists.getById(listName);

        data.map(d => {
            list.items.getById(d.Id).update(d).then((b: any) => {
                // console.log(b);
            });
        })

        // Executes the batched calls
        await execute();
    }

    public getUsers(username: string): Promise<any> {
        return new Promise<any>((resolve) => {
            this._sp.profiles.getPropertiesFor(username).then((profile: any) => { })
        });
    }
    public async getGroupMembers(groupId: number): Promise<string[]> {
        try {
            // Get the SharePoint web
            const web = this._sp.web;

            // Get group members by ID
            const groupMembers = await web.siteGroups.getById(groupId).users();

            // Extract email addresses from the group members
            const UsersMail: string[] = groupMembers.map((member) => member.Email);

            return UsersMail;
        } catch (error) {
            console.error('Error fetching group members:', error);
            throw error;
        }
    }


    public sendEmail(to: string[], cc: string[], subject?: string, bodyContent?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const emailProps: EmailProperties = {
                To: to,
                CC: cc,
                Subject: subject || "",
                Body: bodyContent || "",
                AdditionalHeaders: {
                    "content-type": "text/html"
                }
            };

            this._sp.utility.sendEmail(emailProps)
                .then(() => {
                    console.log("Email Sent!");
                    resolve(); // Resolve the promise when the email is sent successfully
                })
                .catch((error) => {
                    console.error("Error sending email:", error);
                    reject(error); // Reject the promise if there's an error
                });
        });
    }

    public getMultipleListData(listName: string[]): Promise<any[]> {
        const httpReqArray = new Array();

        listName.map(l => {
            httpReqArray.push(this._sp.web.lists.getById(l).items.getAll());
        })

        return new Promise<any[]>(async (resolve) => await Promise.all(httpReqArray).then(dataArr => {
            resolve(dataArr);
        }));
    }

   

    public delay(ms: any): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static readAsBuffer(oneFileObject: File) {
        return new Promise<any>((resolve, reject) => {



            var reader = new FileReader();
            reader.onloadend = (e) => {
                resolve(reader.result);
            };

            reader.readAsArrayBuffer(oneFileObject);


        });
    }

    
    // Helper function to introduce a delay
    public sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    public async getComments(listId: string, itemId: number): Promise<any[]> {
        return new Promise<any[]>((resolve) => {
            this._sp.web.lists.getById(listId).items.getById(itemId).comments
                .expand("likedBy")()
                .then(data => { resolve(data); });

        })
    }

    public async isUserHavingPermission(permissionKind: PermissionKind): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            const permssions = await this._sp.web.getCurrentUserEffectivePermissions();
            if (this._sp.web.hasPermissions(permssions, permissionKind)) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    }

    public async getDefaultListView(list: string, isListId?: boolean): Promise<string> {
        return new Promise<string>(async resolve => {
            let _list = isListId ? this._sp.web.lists.getById(list) : this._sp.web.lists.getByTitle(list);
            let _listViewId = (await _list.defaultView()).Id;
            resolve(_listViewId);
        })
    }

    public async getListViewFields(list: string, isListId?: boolean, listViewId?: string): Promise<string[]> {
        return new Promise<string[]>(async resolve => {
            let _fields: string[];
            let _list = isListId ? this._sp.web.lists.getById(list) : this._sp.web.lists.getByTitle(list);
            if (listViewId) {
                _fields = (await _list.views.getById(listViewId).fields()).Items;
                return resolve(_fields);
            }
            else {
                await _list.defaultView().then(async (data: IViewInfo) => {
                    await this.getListViewFields(list, isListId, data.Id).then(async (data: any[]) => {
                        return resolve(data);
                    })
                })
            }
        });
    }

    public async getCurrentUserSiteGroups(): Promise<any[]> {
        return new Promise<any[]>(async (resolve) => {
            const groups = await this._sp.web.currentUser.groups();
            console.log(groups);
            resolve(groups);
        });
    }

}