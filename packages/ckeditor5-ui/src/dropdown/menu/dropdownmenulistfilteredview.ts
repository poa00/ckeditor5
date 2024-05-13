/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistfilteredview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type { DropdownMenuRootFactoryDefinition } from './typings.js';
import type FilteredView from '../../search/filteredview.js';

import { filterDropdownMenuTreeByRegExp } from './search/filterdropdownmenutreebyregexp.js';

import View from '../../view.js';
import DropdownMenuListFoundListView from './dropdownmenulistfoundlistview.js';
import DropdownMenuRootListView from './dropdownmenurootlistview.js';

/**
 * TODO
 */
export default class DropdownMenuListFilteredView extends View implements FilteredView {
	/**
	 * TODO
	 */
	private _menuView: DropdownMenuRootListView;

	/**
	 * TODO
	 */
	private _foundListView: DropdownMenuListFoundListView | null = null;

	/**
	 * Creates an instance of the list view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale, definition: DropdownMenuRootFactoryDefinition ) {
		super( locale );

		this._menuView = new DropdownMenuRootListView( locale, definition );
		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-dropdown-menu-filter'
				],
				tabindex: -1
			}
		} );
	}

	public filter( regExp: RegExp | null ): { resultsCount: number; totalItemsCount: number } {
		const { element } = this;
		const { filteredTree, resultsCount, totalItemsCount } = filterDropdownMenuTreeByRegExp( regExp, this._menuView.tree );

		element!.innerHTML = '';

		if ( this._foundListView ) {
			this._foundListView.destroy();
		}

		if ( resultsCount !== totalItemsCount ) {
			this._foundListView = new DropdownMenuListFoundListView( this.locale!, regExp, filteredTree );
			this._foundListView.render();

			element!.appendChild( this._foundListView.element! );
		} else {
			if ( !this._menuView.isRendered ) {
				this._menuView.render();
			}

			element!.appendChild( this._menuView.element! );
		}

		return {
			resultsCount,
			totalItemsCount
		};
	}

	public focus(): void {
		this._menuView.focus();
	}
}
