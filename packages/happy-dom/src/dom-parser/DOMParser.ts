import IDocument from '../nodes/document/IDocument.js';
import XMLParser from '../xml-parser/XMLParser.js';
import Node from '../nodes/node/Node.js';
import DOMException from '../exception/DOMException.js';
import DocumentFragment from '../nodes/document-fragment/DocumentFragment.js';
import IBrowserWindow from '../window/IBrowserWindow.js';

/**
 * DOM parser.
 *
 * Reference:
 * https://developer.mozilla.org/en-US/docs/Web/API/DOMParser.
 */
export default class DOMParser {
	readonly #window: IBrowserWindow;

	/**
	 * Constructor.
	 *
	 * @param window Window.
	 */
	constructor(window: IBrowserWindow) {
		this.#window = window;
	}

	/**
	 * Parses HTML and returns a root element.
	 *
	 * @param string HTML data.
	 * @param mimeType Mime type.
	 * @returns Root element.
	 */
	public parseFromString(string: string, mimeType: string): IDocument {
		if (!mimeType) {
			throw new DOMException('Second parameter "mimeType" is mandatory.');
		}

		const newDocument = <IDocument>this.#createDocument(mimeType);

		const root = <DocumentFragment>XMLParser.parse(newDocument, string, { evaluateScripts: true });
		let documentElement = null;
		let documentTypeNode = null;

		for (const node of root.__childNodes__) {
			if (node['tagName'] === 'HTML') {
				documentElement = node;
			} else if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
				documentTypeNode = node;
			}

			if (documentElement && documentTypeNode) {
				break;
			}
		}

		if (documentElement) {
			if (documentTypeNode) {
				newDocument.appendChild(documentTypeNode);
			}
			newDocument.appendChild(documentElement);
			const body = newDocument.body;
			if (body) {
				for (const child of root.__childNodes__.slice()) {
					body.appendChild(child);
				}
			}
		} else {
			switch (mimeType) {
				case 'image/svg+xml':
					{
						for (const node of root.__childNodes__.slice()) {
							newDocument.appendChild(node);
						}
					}
					break;
				case 'text/html':
				default:
					{
						const documentElement = newDocument.createElement('html');
						const bodyElement = newDocument.createElement('body');
						const headElement = newDocument.createElement('head');

						documentElement.appendChild(headElement);
						documentElement.appendChild(bodyElement);
						newDocument.appendChild(documentElement);

						for (const node of root.__childNodes__.slice()) {
							bodyElement.appendChild(node);
						}
					}
					break;
			}
		}

		return newDocument;
	}

	/**
	 *
	 * @param mimeType Mime type.
	 * @returns IDocument.
	 */
	#createDocument(mimeType: string): IDocument {
		switch (mimeType) {
			case 'text/html':
				return new this.#window.HTMLDocument();
			case 'image/svg+xml':
				return new this.#window.SVGDocument();
			case 'text/xml':
			case 'application/xml':
			case 'application/xhtml+xml':
				return new this.#window.XMLDocument();
			default:
				throw new DOMException(`Unknown mime type "${mimeType}".`);
		}
	}
}
