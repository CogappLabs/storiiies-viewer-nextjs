"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Header, ViewerSwitcher } from "@/components/ui";
import "@cogapp/storiiies-viewer/dist/storiiies-viewer.css";

const StoriiiesPreview = () => {
	const params = useParams();
	const id = params.id as string;
	const [manifestUrl, setManifestUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	const viewerRef = useRef<unknown>(null);

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
					setError(
						err instanceof Error ? err.message : "Failed to load viewer",
					);
				}
			})
			.catch((err) => {
				setError(`Failed to load StoriiiesViewer: ${err.message}`);
			});
	}, [manifestUrl]);

	return (
		<div className="h-screen flex flex-col">
			<Header
				title="Storiiies Viewer"
				backLink={{ href: `/editor/${id}`, label: "Back to Editor" }}
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
