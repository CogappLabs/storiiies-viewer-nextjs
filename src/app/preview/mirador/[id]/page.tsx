"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Header, ViewerSwitcher } from "@/components/ui";

const MiradorPreview = () => {
	const params = useParams();
	const id = params.id as string;
	const [manifestUrl, setManifestUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	const viewerRef = useRef<boolean>(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setManifestUrl(`${window.location.origin}/api/manifest/${id}`);
		}
	}, [id]);

	useEffect(() => {
		if (!manifestUrl || viewerRef.current) return;

		// Dynamically import Mirador
		import("mirador")
			.then((Mirador) => {
				try {
					viewerRef.current = true;
					Mirador.viewer({
						id: "mirador-viewer",
						windows: [
							{
								manifestId: manifestUrl,
							},
						],
					});
				} catch (err) {
					setError(
						err instanceof Error ? err.message : "Failed to load viewer",
					);
				}
			})
			.catch((err) => {
				setError(`Failed to load Mirador: ${err.message}`);
			});
	}, [manifestUrl]);

	return (
		<div className="h-screen flex flex-col">
			<Header
				title="Mirador Viewer"
				backLink={{ href: `/editor/${id}`, label: "Back to Editor" }}
				fullWidth
				actions={<ViewerSwitcher storyId={id} current="mirador" />}
			/>

			{error && (
				<div className="bg-red-50 text-red-600 p-4 text-center">{error}</div>
			)}

			<div id="mirador-viewer" className="flex-1 relative" />
		</div>
	);
};

export default MiradorPreview;
