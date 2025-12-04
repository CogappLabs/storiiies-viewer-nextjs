"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Header, ViewerSwitcher } from "@/components/ui";
import { useStrings } from "@/lib/i18n/LanguageProvider";

const MiradorPreview = () => {
	const params = useParams();
	const id = params.id as string;
	const [manifestUrl, setManifestUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	const viewerRef = useRef<boolean>(false);
	const strings = useStrings();
	const viewerLabel = strings.common.viewer(strings.viewers.mirador);
	const { errorLoading, errorGeneric } = strings.preview;

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
