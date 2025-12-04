declare module "mirador" {
	interface MiradorWindow {
		manifestId: string;
	}

	interface MiradorConfig {
		id: string;
		windows?: MiradorWindow[];
	}

	export function viewer(config: MiradorConfig): unknown;
}

declare module "@cogapp/storiiies-viewer" {
	interface StoriiiesViewerConfig {
		container: string | HTMLElement;
		manifestUrl: string;
	}

	export default class StoriiiesViewer {
		constructor(config: StoriiiesViewerConfig);
	}
}
