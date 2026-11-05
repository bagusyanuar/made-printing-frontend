/**
 * Application theme store for Made Printing ERP.
 * Persists light/dark mode preference in localStorage.
 */
export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'made-printing-theme';

const DEFAULT_THEME: Theme = 'light';

function isTheme(value: unknown): value is Theme {
	return value === 'light' || value === 'dark';
}

/** Reads the persisted choice. Falls back to light on corrupt or missing value. */
export function readStoredTheme(): Theme {
	if (typeof localStorage === 'undefined') return DEFAULT_THEME;
	const stored: unknown = localStorage.getItem(THEME_STORAGE_KEY);
	return isTheme(stored) ? stored : DEFAULT_THEME;
}

export class ThemeStore {
	#theme = $state<Theme>(DEFAULT_THEME);

	constructor(initial: Theme = readStoredTheme()) {
		this.#theme = initial;
	}

	get theme(): Theme {
		return this.#theme;
	}

	get isDark(): boolean {
		return this.#theme === 'dark';
	}

	set(theme: Theme): void {
		this.#theme = theme;
		this.#persist(theme);
		this.#apply(theme);
	}

	toggle(): void {
		this.set(this.#theme === 'dark' ? 'light' : 'dark');
	}

	/**
	 * Re-syncs the DOM with the store. Call from root layout.
	 */
	sync(): void {
		if (typeof document === 'undefined') return;
		this.#apply(this.#theme);
	}

	#persist(theme: Theme): void {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(THEME_STORAGE_KEY, theme);
		} catch {
			// Storage quota exceeded or disabled in private browsing
		}
	}

	#apply(theme: Theme): void {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		if (theme === 'dark') {
			root.classList.add('dark');
			root.setAttribute('data-theme', 'dark');
		} else {
			root.classList.remove('dark');
			root.setAttribute('data-theme', 'light');
		}
	}
}

export const themeStore = new ThemeStore();
