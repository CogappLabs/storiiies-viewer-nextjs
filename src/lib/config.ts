export const VIEWER_CONFIG = {
	zoomInFactor: 1.5,
	zoomOutFactor: 0.67,
	crosshair: {
		minDimension: 5,
		sizeRatio: 0.15,
		strokeColor: "#717171",
		strokeWidth: 2,
		initialUpdateDelayMs: 100,
		observedAttributes: ["x", "y", "width", "height"] as const,
	},
} as const;

export const UI_CONFIG = {
	sharePopupCopyTimeoutMs: 2000,
} as const;
