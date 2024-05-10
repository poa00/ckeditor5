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

import View from '../../view.js';
import DropdownMenuRootListView from './dropdownmenurootlistview.js';
import { searchDropdownMenuTreeByRegExp } from './search/searchdropdownmenutree.js';

/**
 * TODO
 */
export default class DropdownMenuListFilteredView extends View implements FilteredView {
	/**
	 * TODO
	 */
	private _menuView: DropdownMenuRootListView;

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
			},

			children: [
				this._menuView
			]
		} );
	}

	public filter( regExp: RegExp | null ): { resultsCount: number; totalItemsCount: number } {
		const { filteredTree, resultsCount, totalItemsCount } = searchDropdownMenuTreeByRegExp( regExp, this._menuView.menus );

		console.info( regExp, { filteredTree, resultsCount, totalItemsCount } );

		return {
			resultsCount,
			totalItemsCount
		};
	}

	public focus(): void {
		this._menuView.focus();
	}
}
