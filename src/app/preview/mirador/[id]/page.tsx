"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header, ViewerSwitcher } from "@/components/ui";
import { useStrings } from "@/lib/i18n/LanguageProvider";

const MiradorPreview = () => {
	const params = useParams();
	const id = params.id as string;
	const [iframeSrc, setIframeSrc] = useState("");
	const strings = useStrings();
	const viewerLabel = strings.common.viewer(strings.viewers.mirador);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const manifestUrl = `${window.location.origin}/api/manifest/${id}`;
			setIframeSrc(`/mirador.html?manifest=${encodeURIComponent(manifestUrl)}`);
		}
	}, [id]);

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

			{iframeSrc && (
				<iframe
					src={iframeSrc}
					className="flex-1 w-full border-0"
					title={viewerLabel}
				/>
			)}
		</div>
	);
};

export default MiradorPreview;
