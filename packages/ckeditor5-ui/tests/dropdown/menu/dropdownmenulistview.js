/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import { ListView, DropdownMenuListView } from '../../../src/index.js';

describe( 'DropdownMenuListView', () => {
	let listView, locale;

	beforeEach( () => {
		locale = new Locale();
		listView = new DropdownMenuListView( locale );
	} );

	afterEach( () => {
		listView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from ListView', () => {
			expect( listView ).to.be.instanceOf( ListView );
		} );

		it( 'should have #role set', () => {
			expect( listView.role ).to.equal( 'menu' );
		} );
	} );
} );
