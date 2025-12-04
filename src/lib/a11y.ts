const FOCUSABLE_SELECTORS = [
	"a[href]",
	"area[href]",
	"button:not([disabled])",
	'input:not([disabled]):not([type="hidden"])',
	"select:not([disabled])",
	"textarea:not([disabled])",
	'[tabindex]:not([tabindex="-1"])',
] as const;

export const trapFocus = (
	container: HTMLElement | null,
	event: KeyboardEvent,
) => {
	if (event.key !== "Tab" || !container) {
		return;
	}

	const focusable = container.querySelectorAll<HTMLElement>(
		FOCUSABLE_SELECTORS.join(","),
	);

	if (focusable.length === 0) {
		return;
	}

	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	const active = document.activeElement;

	if (!event.shiftKey && active === last) {
		event.preventDefault();
		first.focus();
	} else if (event.shiftKey && active === first) {
		event.preventDefault();
		last.focus();
	}
};
