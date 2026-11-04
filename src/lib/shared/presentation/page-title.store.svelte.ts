/**
 * Current page title rendered in the app navbar next to the sidebar collapse button.
 */
export class PageTitleStore {
	#title = $state<string>('');

	get title(): string {
		return this.#title;
	}

	set(title: string): void {
		this.#title = title;
	}
}

export const pageTitleStore = new PageTitleStore();

