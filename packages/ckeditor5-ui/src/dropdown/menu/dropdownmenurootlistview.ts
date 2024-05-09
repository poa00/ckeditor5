/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenurootlistview
 */

import type { Locale, ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
import type DropdownMenuListItemButtonView from './dropdownmenulistitembuttonview.js';
import type { MenuBarMenuChangeIsOpenEvent } from '../../menubar/menubarview.js';

import { isDropdownMenuViewItem, type DropdownMenuViewItem, type DropdownMenuDefinition } from './typings.js';
import { DropdownMenuView } from './dropdownmenuview.js';
import { DropdownMenuListItemView } from './dropdownmenulistitemview.js';
import { DropdownRootMenuBehaviors } from './utils/dropdownmenubehaviors.js';

import ListSeparatorView from '../../list/listseparatorview.js';
import ListItemView from '../../list/listitemview.js';
import DropdownMenuListView from './dropdownmenulistview.js';

const EVENT_NAME_DELEGATES = [ 'mouseenter', 'arrowleft', 'arrowright', 'change:isOpen' ] as const;

/**
 * TODO
 */
export default class DropdownMenuRootListView extends DropdownMenuListView {
	/**
	 * TODO
	 */
	public menus: Array<DropdownMenuView> = [];

	/**
	 * Indicates whether any of top-level menus are open in the menu bar. To close
	 * the menu bar use the {@link #close} method.
	 *
	 * @observable
	 */
	declare public isOpen: boolean;

	constructor( locale: Locale, definition: DropdownMenuRootDefinition ) {
		super( locale );

		this.set( 'isOpen', false );
		this._setupIsOpenUpdater();
		this._createFromDefinition( definition );
	}

	/**
	 * Closes all menus in the bar.
	 */
	public close(): void {
		for ( const menuView of this.menus ) {
			menuView.isOpen = false;
		}
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		DropdownRootMenuBehaviors.toggleMenusAndFocusItemsOnHover( this );
		DropdownRootMenuBehaviors.closeMenuWhenAnotherOnTheSameLevelOpens( this );
		DropdownRootMenuBehaviors.closeOnClickOutside( this );
		DropdownRootMenuBehaviors.closeWhenOutsideElementFocused( this );
	}

	/**
	 * TODO
	 */
	private _createFromDefinition( { items }: DropdownMenuRootDefinition ) {
		const topLevelCategoryMenuViews = items.map( menuDefinition => {
			const listItem = new DropdownMenuListItemView( this.locale! );

			listItem.children.add(
				this._createMenu( {
					menuDefinition
				} )
			);

			return listItem;
		} );

		this.items.addMany( topLevelCategoryMenuViews );
	}

	/**
	 * TODO
	 */
	private _createMenu( { menuDefinition, parentMenuView }: {
		menuDefinition: DropdownMenuDefinition;
		parentMenuView?: DropdownMenuView;
	} ) {
		const locale = this.locale!;
		const menuView = new DropdownMenuView( locale );

		this.registerMenu( menuView, parentMenuView );

		menuView.buttonView.set( {
			label: menuDefinition.label
		} );

		// Defer the creation of the menu structure until it gets open. This is a performance optimization
		// that shortens the time needed to create the editor.
		menuView.once<ObservableChangeEvent<boolean>>( 'change:isOpen', () => {
			const listView = new DropdownMenuListView( locale );
			listView.ariaLabel = menuDefinition.label;
			menuView.panelView.children.add( listView );

			listView.items.addMany( this._createMenuItems( { menuDefinition, parentMenuView: menuView } ) );
		} );

		return menuView;
	}

	private _createMenuItems( { menuDefinition, parentMenuView }: {
		menuDefinition: DropdownMenuDefinition;
		parentMenuView: DropdownMenuView;
	} ): Array<DropdownMenuListItemView | ListSeparatorView> {
		const locale = this.locale!;
		const items = [];

		for ( const menuGroupDefinition of menuDefinition.groups ) {
			for ( const itemDefinition of menuGroupDefinition.items ) {
				const menuItemView = new DropdownMenuListItemView( locale, parentMenuView );

				if ( isDropdownMenuViewItem( itemDefinition ) ) {
					const componentView = this._createMenuItemContentFromInstance( {
						component: itemDefinition,
						parentMenuView
					} );

					if ( !componentView ) {
						continue;
					}

					menuItemView.children.add( componentView );
				} else {
					menuItemView.children.add( this._createMenu( {
						menuDefinition: itemDefinition,
						parentMenuView
					} ) );
				}

				items.push( menuItemView );
			}

			// Separate groups with a separator.
			if ( menuGroupDefinition !== menuDefinition.groups[ menuDefinition.groups.length - 1 ] ) {
				items.push( new ListSeparatorView( locale ) );
			}
		}

		return items;
	}

	/**
	 * TODO
	 */
	private _createMenuItemContentFromInstance( { component, parentMenuView }: {
		component: DropdownMenuViewItem;
		parentMenuView: DropdownMenuView;
	} ): DropdownMenuViewItem | null {
		this._registerMenuTree( component, parentMenuView );

		// Close the whole menu bar when a component is executed.
		component.on( 'execute', () => {
			this.close();
		} );

		return component;
	}

	/**
	 * TODO
	 */
	private _registerMenuTree( componentView: DropdownMenuViewItem, parentMenuView: DropdownMenuView ) {
		if ( !( componentView instanceof DropdownMenuView ) ) {
			componentView.delegate( 'mouseenter' ).to( parentMenuView );

			return;
		}

		this.registerMenu( componentView, parentMenuView );

		const menuBarItemsList = componentView.panelView.children
			.filter( child => child instanceof DropdownMenuListView )[ 0 ] as DropdownMenuListView | undefined;

		if ( !menuBarItemsList ) {
			componentView.delegate( 'mouseenter' ).to( parentMenuView );

			return;
		}

		const nonSeparatorItems = menuBarItemsList.items.filter( item => item instanceof ListItemView ) as Array<ListItemView>;

		for ( const item of nonSeparatorItems ) {
			this._registerMenuTree(
				item.children.get( 0 ) as DropdownMenuView | DropdownMenuListItemButtonView,
				componentView
			);
		}
	}

	/**
	 * TODO
	 */
	public registerMenu( menuView: DropdownMenuView, parentMenuView: DropdownMenuView | null = null ): void {
		if ( parentMenuView ) {
			menuView.delegate( ...EVENT_NAME_DELEGATES ).to( parentMenuView );
			menuView.parentMenuView = parentMenuView;
		} else {
			menuView.delegate( ...EVENT_NAME_DELEGATES ).to( this, name => 'menu:' + name );
		}

		menuView._attachBehaviors();

		this.menus.push( menuView );
	}

	/**
	 * Manages the state of the {@link #isOpen} property of the menu bar. Because the state is a sum of individual
	 * top-level menus' states, it's necessary to listen to their changes and update the state accordingly.
	 *
	 * Additionally, it prevents from unnecessary changes of `isOpen` when one top-level menu opens and another closes
	 * (regardless of in which order), maintaining a stable `isOpen === true` in that situation.
	 */
	private _setupIsOpenUpdater() {
		let closeTimeout: ReturnType<typeof setTimeout>;

		// TODO: This is not the prettiest approach but at least it's simple.
		this.on<MenuBarMenuChangeIsOpenEvent>( 'menu:change:isOpen', ( evt, name, isOpen ) => {
			clearTimeout( closeTimeout );

			if ( isOpen ) {
				this.isOpen = true;
			} else {
				closeTimeout = setTimeout( () => {
					this.isOpen = Array.from( this.menus ).some( menuView => menuView.isOpen );
				}, 0 );
			}
		} );
	}
}

/**
 * TODO
 */
export type DropdownMenuRootDefinition = {
	items: Array<DropdownMenuDefinition>;
};
