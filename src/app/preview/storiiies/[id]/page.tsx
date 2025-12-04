"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Header, ViewerSwitcher } from "@/components/ui";
import "@cogapp/storiiies-viewer/dist/storiiies-viewer.css";
import { useStrings } from "@/lib/i18n/LanguageProvider";

const StoriiiesPreview = () => {
	const params = useParams();
	const id = params.id as string;
	const [manifestUrl, setManifestUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	const viewerRef = useRef<unknown>(null);
	const strings = useStrings();
	const viewerLabel = strings.common.viewer(strings.viewers.storiiies);
	const { errorLoading, errorGeneric } = strings.preview;

	useEffect(() => {
		if (typeof window !== "undefined") {
			setManifestUrl(`${window.location.origin}/api/manifest/${id}`);
		}
	}, [id]);

	useEffect(() => {
		if (!manifestUrl) return;

		// Dynamically import StoriiiesViewer
		import("@cogapp/storiiies-viewer")
			.then((module) => {
				const StoriiiesViewer = module.default;

				try {
					// Clear any previous viewer
					const container = document.getElementById("storiiies-viewer");
					if (container) {
						container.innerHTML = "";
					}

					// Use CSS selector as per docs
					viewerRef.current = new StoriiiesViewer({
						container: "#storiiies-viewer",
						manifestUrl: manifestUrl,
					});
				} catch (err) {
					const message = err instanceof Error ? err.message : errorGeneric;
					setError(errorLoading(viewerLabel, message));
				}
			})
			.catch((err) => {
				setError(
					errorLoading(
						viewerLabel,
						err instanceof Error ? err.message : errorGeneric,
					),
				);
			});
	}, [errorGeneric, errorLoading, manifestUrl, viewerLabel]);

	return (
		<div className="h-screen flex flex-col">
			<Header
				title={viewerLabel}
				backLink={{
					href: `/editor/${id}`,
					label: strings.preview.backToEditor,
				}}
				fullWidth
				actions={<ViewerSwitcher storyId={id} current="storiiies" />}
			/>

			{error && (
				<div className="bg-red-50 text-red-600 p-4 text-center">{error}</div>
			)}

			<div id="storiiies-viewer" className="flex-1" />
		</div>
	);
};

export default StoriiiesPreview;
