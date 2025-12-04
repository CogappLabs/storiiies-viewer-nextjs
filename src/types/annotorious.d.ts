declare module "@recogito/annotorious-openseadragon" {
	import OpenSeadragon from "openseadragon";

	interface W3CAnnotation {
		"@context": string;
		id: string;
		type: string;
		body: { type: string; value: string; purpose: string }[];
		target: {
			source: string;
			selector: {
				type: string;
				conformsTo: string;
				value: string;
			};
		};
	}

	interface AnnotoriousConfig {
		allowEmpty?: boolean;
		disableEditor?: boolean;
		readOnly?: boolean;
		drawOnSingleClick?: boolean;
		fragmentUnit?: "pixel" | "percent";
		hotkey?: object;
		locale?: string;
	}

	interface AnnotoriousInstance {
		on(event: string, callback: (annotation: W3CAnnotation) => void): void;
		off(event: string, callback: (annotation: W3CAnnotation) => void): void;
		addAnnotation(annotation: W3CAnnotation): void;
		removeAnnotation(annotation: W3CAnnotation | string): void;
		setAnnotations(annotations: W3CAnnotation[]): void;
		getAnnotations(): W3CAnnotation[];
		selectAnnotation(annotation: W3CAnnotation | string): void;
		fitBounds(annotation: W3CAnnotation | string, immediately?: boolean): void;
		setDrawingEnabled(enabled: boolean): void;
		destroy(): void;
	}

	function Annotorious(
		viewer: OpenSeadragon.Viewer,
		config?: AnnotoriousConfig,
	): AnnotoriousInstance;

	export default Annotorious;
}

declare module "@recogito/annotorious-openseadragon/dist/annotorious.min.css";
