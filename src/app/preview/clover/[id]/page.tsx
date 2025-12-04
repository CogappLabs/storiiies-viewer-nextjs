"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header, ViewerSwitcher } from "@/components/ui";

// Dynamic import for Clover Viewer (requires client-side only)
const Viewer = dynamic(() => import("@samvera/clover-iiif/viewer"), {
	ssr: false,
	loading: () => (
		<div className="flex-1 flex items-center justify-center">
			Loading viewer...
		</div>
	),
});

const CloverPreview = () => {
	const params = useParams();
	const id = params.id as string;
	const [manifestUrl, setManifestUrl] = useState("");

	useEffect(() => {
		if (typeof window !== "undefined") {
			setManifestUrl(`${window.location.origin}/api/manifest/${id}`);
		}
	}, [id]);

	return (
		<div className="h-screen flex flex-col">
			<Header
				title="Clover Viewer"
				backLink={{ href: `/editor/${id}`, label: "Back to Editor" }}
				fullWidth
				actions={<ViewerSwitcher storyId={id} current="clover" />}
			/>

			<div className="flex-1">
				{manifestUrl && <Viewer iiifContent={manifestUrl} />}
			</div>
		</div>
	);
};

export default CloverPreview;
