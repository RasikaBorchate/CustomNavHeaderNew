import { override } from '@microsoft/decorators';

import { BaseApplicationCustomizer, PlaceholderName } from '@microsoft/sp-application-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';

import { MegaMenu, IMegaMenuProps } from '../../components/MegaMenu';
import { MegaMenuService } from '../../service/MegaMenuService';
import { TopLevelMenu } from '../../model/TopLevelMenu';
require('./css/style')
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICustomHeaderApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;

}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class CustomHeaderApplicationCustomizer
  extends BaseApplicationCustomizer<ICustomHeaderApplicationCustomizerProperties> {
  private headerPlaceholder: any;
  private _onDispose(): void {
  }

  @override
  public onInit(): Promise<void> {
    if (!this.headerPlaceholder) {
      this.headerPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, { onDispose: this._onDispose });
   
      if (this.headerPlaceholder && this.headerPlaceholder.domElement) {
        console.log("PageHeader placeholder is OK.");
  
        MegaMenuService.runListprovision(this.context).then((response) => {
      //   MegaMenuService.getMenuItems("https://conais.sharepoint.com/sites/SPFXDEV/")
        MegaMenuService.getMenuItems("https://bmrn.sharepoint.com/sites/bioweb-home/")
         
            .then((topLevelMenus: TopLevelMenu[]) => {
              const element: React.ReactElement<IMegaMenuProps> = React.createElement(
                MegaMenu,
                {
                  topLevelMenuItems: topLevelMenus,
                  spfxContext: this.context,
                });
  
              ReactDom.render(element, this.headerPlaceholder.domElement);
            })
            .catch((error: any) => {
              console.error(`Error trying to read menu items or render component : ${error.message}`);
            });
        });
      } else {
        console.error('PageHeader placeholder not found or already populated.');
      }
    }
  
    return Promise.resolve();
  }
  


  @override
  public onRender(): void {

    if (!this.headerPlaceholder) {
      this.headerPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);


    }


  }

}
