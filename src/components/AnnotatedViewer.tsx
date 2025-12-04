"use client";

import OpenSeadragon from "openseadragon";
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import type { Annotation } from "@/generated/prisma/client";

// Annotorious types
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

interface AnnotoriousInstance {
	on: (event: string, callback: (annotation: W3CAnnotation) => void) => void;
	off: (event: string, callback: (annotation: W3CAnnotation) => void) => void;
	addAnnotation: (annotation: W3CAnnotation) => void;
	removeAnnotation: (annotation: W3CAnnotation | string) => void;
	setAnnotations: (annotations: W3CAnnotation[]) => void;
	getAnnotations: () => W3CAnnotation[];
	selectAnnotation: (annotation: W3CAnnotation | string) => void;
	cancelSelected: () => void;
	fitBounds: (
		annotation: W3CAnnotation | string,
		immediately?: boolean,
	) => void;
	setDrawingEnabled: (enabled: boolean) => void;
	destroy: () => void;
}

interface ViewportBounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface AnnotationData {
	rect: ViewportBounds;
	viewport: ViewportBounds;
}

interface Props {
	imageUrl: string;
	imageWidth: number;
	imageHeight: number;
	annotations: Annotation[];
	onAnnotationUpdate?: (
		id: string,
		coords: { x: number; y: number; width: number; height: number },
	) => void;
	onAnnotationDelete?: (id: string) => void;
	onAnnotationSelect?: (id: string | null) => void;
	selectedAnnotationId?: string | null;
	showCrosshairs?: boolean;
	onToggleCrosshairs?: () => void;
}

// Expose methods via ref
export interface AnnotatedViewerHandle {
	getViewportBounds: () => AnnotationData | null;
}

// Parse xywh fragment from W3C annotation
const parseFragment = (
	value: string,
): { x: number; y: number; width: number; height: number } | null => {
	const match = value.match(
		/xywh=pixel:([0-9.]+),([0-9.]+),([0-9.]+),([0-9.]+)/,
	);
	if (!match) return null;
	return {
		x: parseFloat(match[1]),
		y: parseFloat(match[2]),
		width: parseFloat(match[3]),
		height: parseFloat(match[4]),
	};
};

// Convert our annotation to W3C format
const toW3C = (annotation: Annotation, imageUrl: string): W3CAnnotation => ({
	"@context": "http://www.w3.org/ns/anno.jsonld",
	id: annotation.id,
	type: "Annotation",
	body: [
		{ type: "TextualBody", value: annotation.text, purpose: "commenting" },
	],
	target: {
		source: imageUrl,
		selector: {
			type: "FragmentSelector",
			conformsTo: "http://www.w3.org/TR/media-frags/",
			value: `xywh=pixel:${annotation.x},${annotation.y},${annotation.width},${annotation.height}`,
		},
	},
});

const AnnotatedViewer = forwardRef<AnnotatedViewerHandle, Props>(
	(
		{
			imageUrl,
			imageWidth,
			imageHeight,
			annotations,
			onAnnotationUpdate,
			onAnnotationDelete,
			onAnnotationSelect,
			selectedAnnotationId,
			showCrosshairs = false,
			onToggleCrosshairs,
		},
		ref,
	) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
		const annoRef = useRef<AnnotoriousInstance | null>(null);
		const [isReady, setIsReady] = useState(false);

		// Expose getViewportBounds method via ref
		useImperativeHandle(ref, () => ({
			getViewportBounds: (): AnnotationData | null => {
				const viewer = viewerRef.current;
				if (!viewer) return null;

				const viewportRect = viewer.viewport.getBounds();
				const imageRect =
					viewer.viewport.viewportToImageRectangle(viewportRect);

				// Clamp to image bounds
				const x = Math.max(0, imageRect.x);
				const y = Math.max(0, imageRect.y);
				const width = Math.min(imageRect.width, imageWidth - x);
				const height = Math.min(imageRect.height, imageHeight - y);

				// Ensure we don't exceed image dimensions
				const clampedWidth = Math.min(width, imageWidth);
				const clampedHeight = Math.min(height, imageHeight);

				return {
					rect: {
						x,
						y,
						width: clampedWidth,
						height: clampedHeight,
					},
					viewport: {
						x,
						y,
						width: clampedWidth,
						height: clampedHeight,
					},
				};
			},
		}));

		// Initialize OpenSeadragon and Annotorious
		useEffect(() => {
			if (!containerRef.current) return;

			const viewer = OpenSeadragon({
				element: containerRef.current,
				tileSources: `${imageUrl}/info.json`,
				showNavigationControl: false,
				gestureSettingsMouse: { clickToZoom: false },
			});

			viewerRef.current = viewer;

			// Wait for OpenSeadragon to be ready before initializing Annotorious
			viewer.addHandler("open", () => {
				setIsReady(true);
				// Dynamically import Annotorious (it doesn't play well with SSR)
				import("@recogito/annotorious-openseadragon").then((Annotorious) => {
					import(
						"@recogito/annotorious-openseadragon/dist/annotorious.min.css"
					);

					const anno = Annotorious.default(viewer, {
						allowEmpty: false,
						disableEditor: true, // We'll use our own editor
						fragmentUnit: "pixel",
					}) as AnnotoriousInstance;

					annoRef.current = anno;

					// Load existing annotations
					const w3cAnnotations = annotations.map((a) => toW3C(a, imageUrl));
					anno.setAnnotations(w3cAnnotations);

					// Function to add or update crosshairs on an annotation/selection element
					const updateCrosshairs = (shapeGroup: Element) => {
						const inner = shapeGroup.querySelector(
							".a9s-inner",
						) as SVGRectElement;
						if (!inner) return;

						const x = parseFloat(inner.getAttribute("x") || "0");
						const y = parseFloat(inner.getAttribute("y") || "0");
						const width = parseFloat(inner.getAttribute("width") || "0");
						const height = parseFloat(inner.getAttribute("height") || "0");

						if (width < 5 || height < 5) return;

						// Center is at x + width/2, y + height/2
						const centerX = x + width / 2;
						const centerY = y + height / 2;
						const size = Math.min(width, height) * 0.15;

						let group = shapeGroup.querySelector(
							".crosshair-group",
						) as SVGGElement;

						if (!group) {
							// Create new crosshair group
							group = document.createElementNS(
								"http://www.w3.org/2000/svg",
								"g",
							);
							group.setAttribute("class", "crosshair-group");

							const hLine = document.createElementNS(
								"http://www.w3.org/2000/svg",
								"line",
							);
							hLine.setAttribute("class", "crosshair-h");
							hLine.setAttribute("stroke", "#717171");
							hLine.setAttribute("stroke-width", "2");
							hLine.setAttribute("vector-effect", "non-scaling-stroke");

							const vLine = document.createElementNS(
								"http://www.w3.org/2000/svg",
								"line",
							);
							vLine.setAttribute("class", "crosshair-v");
							vLine.setAttribute("stroke", "#717171");
							vLine.setAttribute("stroke-width", "2");
							vLine.setAttribute("vector-effect", "non-scaling-stroke");

							group.appendChild(hLine);
							group.appendChild(vLine);
							shapeGroup.appendChild(group);
						}

						// Update line positions
						const hLine = group.querySelector(".crosshair-h") as SVGLineElement;
						const vLine = group.querySelector(".crosshair-v") as SVGLineElement;

						if (hLine) {
							hLine.setAttribute("x1", String(centerX - size));
							hLine.setAttribute("y1", String(centerY));
							hLine.setAttribute("x2", String(centerX + size));
							hLine.setAttribute("y2", String(centerY));
						}

						if (vLine) {
							vLine.setAttribute("x1", String(centerX));
							vLine.setAttribute("y1", String(centerY - size));
							vLine.setAttribute("x2", String(centerX));
							vLine.setAttribute("y2", String(centerY + size));
						}
					};

					// Update crosshairs on all shapes
					const updateAllCrosshairs = () => {
						const shapes = containerRef.current?.querySelectorAll(
							".a9s-annotation, .a9s-selection",
						);
						shapes?.forEach((shape) => updateCrosshairs(shape));
					};

					// Watch for new annotations or position/size changes
					const observer = new MutationObserver((mutations) => {
						for (const mutation of mutations) {
							// Only update on childList changes (new annotations) or x/y/width/height attribute changes
							if (mutation.type === "childList") {
								requestAnimationFrame(updateAllCrosshairs);
								break;
							}
							if (mutation.type === "attributes") {
								const attr = mutation.attributeName;
								if (
									attr === "x" ||
									attr === "y" ||
									attr === "width" ||
									attr === "height"
								) {
									const shape = (mutation.target as Element).closest(
										".a9s-annotation, .a9s-selection",
									);
									if (shape) {
										requestAnimationFrame(() => updateCrosshairs(shape));
									}
								}
							}
						}
					});

					const svgOverlay = containerRef.current?.querySelector(
						".a9s-annotationlayer",
					);
					if (svgOverlay) {
						observer.observe(svgOverlay, {
							childList: true,
							subtree: true,
							attributes: true,
							attributeFilter: ["x", "y", "width", "height"],
						});
					}

					// Initial update
					setTimeout(updateAllCrosshairs, 100);
				});
			});

			return () => {
				annoRef.current?.destroy();
				viewer.destroy();
				viewerRef.current = null;
				annoRef.current = null;
				setIsReady(false);
			};
		}, [imageUrl, imageWidth, imageHeight]);

		// Handle annotation events
		useEffect(() => {
			const anno = annoRef.current;
			if (!anno) return;

			const handleUpdate = (w3cAnnotation: W3CAnnotation) => {
				const coords = parseFragment(w3cAnnotation.target.selector.value);
				if (coords && onAnnotationUpdate) {
					onAnnotationUpdate(w3cAnnotation.id, coords);
				}
			};

			const handleDelete = (w3cAnnotation: W3CAnnotation) => {
				if (onAnnotationDelete) {
					onAnnotationDelete(w3cAnnotation.id);
				}
			};

			const handleSelect = (w3cAnnotation: W3CAnnotation) => {
				if (onAnnotationSelect) {
					onAnnotationSelect(w3cAnnotation?.id || null);
				}
			};

			anno.on("updateAnnotation", handleUpdate);
			anno.on("deleteAnnotation", handleDelete);
			anno.on("selectAnnotation", handleSelect);

			return () => {
				anno.off("updateAnnotation", handleUpdate);
				anno.off("deleteAnnotation", handleDelete);
				anno.off("selectAnnotation", handleSelect);
			};
		}, [isReady, onAnnotationUpdate, onAnnotationDelete, onAnnotationSelect]);

		// Sync annotations from props
		useEffect(() => {
			const anno = annoRef.current;
			if (!anno) return;

			const w3cAnnotations = annotations.map((a) => toW3C(a, imageUrl));
			anno.setAnnotations(w3cAnnotations);
		}, [isReady, annotations, imageUrl]);

		// Handle selected annotation
		useEffect(() => {
			if (selectedAnnotationId && annoRef.current) {
				annoRef.current.selectAnnotation(selectedAnnotationId);
				annoRef.current.fitBounds(selectedAnnotationId, false);
			}
		}, [selectedAnnotationId]);

		// Toggle crosshair visibility
		useEffect(() => {
			const container = containerRef.current;
			if (!container) return;

			if (showCrosshairs) {
				container.classList.remove("hide-crosshairs");
			} else {
				container.classList.add("hide-crosshairs");
			}
		}, [showCrosshairs]);

		const handleZoomIn = () => {
			const viewer = viewerRef.current;
			if (viewer) {
				viewer.viewport.zoomBy(1.5);
				viewer.viewport.applyConstraints();
			}
		};

		const handleZoomOut = () => {
			const viewer = viewerRef.current;
			if (viewer) {
				viewer.viewport.zoomBy(0.67);
				viewer.viewport.applyConstraints();
			}
		};

		const handleHome = () => {
			const viewer = viewerRef.current;
			if (viewer) {
				viewer.viewport.goHome();
			}
		};

		return (
			<div className="relative h-full w-full">
				<div ref={containerRef} className="h-full w-full" />

				{isReady && (
					<div className="absolute top-4 left-4 flex gap-1 z-10">
						<button
							type="button"
							onClick={handleZoomIn}
							className="bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cogapp-blue focus:ring-offset-2 p-2 rounded shadow border"
							aria-label="Zoom in"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4v16m8-8H4"
								/>
							</svg>
						</button>
						<button
							type="button"
							onClick={handleZoomOut}
							className="bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cogapp-blue focus:ring-offset-2 p-2 rounded shadow border"
							aria-label="Zoom out"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M20 12H4"
								/>
							</svg>
						</button>
						<button
							type="button"
							onClick={handleHome}
							className="bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cogapp-blue focus:ring-offset-2 p-2 rounded shadow border"
							aria-label="Reset view"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
								/>
							</svg>
						</button>
						<button
							type="button"
							onClick={onToggleCrosshairs}
							className={`p-2 rounded shadow border focus:outline-none focus:ring-2 focus:ring-cogapp-blue focus:ring-offset-2 ${
								showCrosshairs
									? "bg-cogapp-charcoal text-cogapp-cream border-cogapp-charcoal hover:bg-cogapp-charcoal/90"
									: "bg-white hover:bg-gray-100"
							}`}
							aria-label={
								showCrosshairs ? "Hide crosshairs" : "Show crosshairs"
							}
							aria-pressed={showCrosshairs}
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4v4m0 8v4m-8-8h4m8 0h4"
								/>
							</svg>
						</button>
					</div>
				)}
			</div>
		);
	},
);

AnnotatedViewer.displayName = "AnnotatedViewer";

export default AnnotatedViewer;
