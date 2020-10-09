import HTMLElement from '../nodes/basic/html-element/HTMLElement';
import Node from '../nodes/basic/node/Node';

/**
 * Custom elements registry.
 */
export default class CustomElementRegistry {
	public _registry: { [k: string]: { elementClass: typeof HTMLElement; extends: string } } = {};
	private _callbacks: { [k: string]: (() => void)[] } = {};

	/**
	 * Defines a custom element class.
	 *
	 * @param tagName Tag name of element.
	 * @param elementClass Element class.
	 * @param [options] Options.
	 */
	public define(
		tagName: string,
		elementClass: typeof HTMLElement,
		options?: { extends: string }
	): void {
		const name = tagName.toLowerCase();
		if (!name.includes('-')) {
			throw new Error(
				"Failed to execute 'define' on 'CustomElementRegistry': \"" +
					name +
					'" is not a valid custom element name.'
			);
		}

		this._registry[name] = {
			elementClass,
			extends: options && options.extends ? options.extends.toLowerCase() : null
		};

		if (this._callbacks[name]) {
			for (const callback of this._callbacks[name]) {
				callback();
			}
			delete this._callbacks[name];
		}
	}

	/**
	 * Returns a defined element class.
	 *
	 * @param tagName Tag name of element.
	 * @param HTMLElement class defined.
	 */
	public get(tagName: string): typeof HTMLElement {
		const name = tagName.toLowerCase();
		return this._registry[name] ? this._registry[name].elementClass : null;
	}

	/**
	 * Upgrades a custom element directly, even before it is connected to its shadow root.
	 *
	 * Not implemented yet.
	 *
	 * @param _root Root node.
	 */
	public upgrade(_root: Node): void {
		// Do nothing
	}

	/**
	 * When defined.
	 *
	 * @param tagName Tag name of element.
	 * @returns Promise.
	 */
	public whenDefined(tagName: string): Promise<void> {
		const lowerCamelCase = tagName.toLowerCase();
		if (this.get(lowerCamelCase)) {
			return Promise.resolve();
		}
		return new Promise(resolve => {
			this._callbacks[lowerCamelCase] = this._callbacks[lowerCamelCase] || [];
			this._callbacks[lowerCamelCase].push(resolve);
		});
	}
}
