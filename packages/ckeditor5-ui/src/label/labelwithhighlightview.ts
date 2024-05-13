/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/label/labelwithhighlightview
 */

import type LabelView from './labelview.js';

import { uid } from '@ckeditor/ckeditor5-utils';
import HighlightedTextView from '../highlightedtext/highlightedtextview.js';

/**
 * A label view that can highlight a text fragment.
 */
export default class LabelWithHighlightView extends HighlightedTextView implements LabelView {
	/**
	 * @inheritDoc
	 */
	public readonly id: string;

	/**
	 * @inheritDoc
	 */
	declare public for: string | undefined;

	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		this.set( 'for', undefined );

		const bind = this.bindTemplate;

		this.id = `ck-editor__label_${ uid() }`;

		this.extendTemplate( {
			attributes: {
				class: [
					'ck',
					'ck-label'
				],
				id: this.id,
				for: bind.to( 'for' )
			}
		} );
	}
}
