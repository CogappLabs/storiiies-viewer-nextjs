"use client";

import { useParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Header, ViewerSwitcher } from "@/components/ui";
import { useStrings } from "@/lib/i18n/LanguageProvider";

const AnnonaPreview = () => {
	const params = useParams();
	const id = params.id as string;
	const [manifestUrl, setManifestUrl] = useState("");
	const [scriptsLoaded, setScriptsLoaded] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const strings = useStrings();
	const viewerLabel = strings.common.viewer(strings.viewers.annona);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setManifestUrl(`${window.location.origin}/api/manifest/${id}`);
		}
	}, [id]);

	// Create the web component safely via DOM API instead of dangerouslySetInnerHTML
	useEffect(() => {
		if (!manifestUrl || !scriptsLoaded || !containerRef.current) return;

		const container = containerRef.current;
		container.innerHTML = "";

		const storyboard = document.createElement("iiif-storyboard");
		storyboard.setAttribute("url", manifestUrl);
		storyboard.setAttribute("styling", "fit: fill;");
		container.appendChild(storyboard);

		return () => {
			container.innerHTML = "";
		};
	}, [manifestUrl, scriptsLoaded]);

	return (
		<div className="h-screen flex flex-col">
			<Script
				src="https://ncsu-libraries.github.io/annona/dist/annona.js"
				onLoad={() => setScriptsLoaded(true)}
			/>
			<link
				rel="stylesheet"
				href="https://ncsu-libraries.github.io/annona/dist/annona.css"
			/>

			<Header
				title={viewerLabel}
				backLink={{
					href: `/editor/${id}`,
					label: strings.preview.backToEditor,
				}}
				fullWidth
				actions={<ViewerSwitcher storyId={id} current="annona" />}
			/>

			<div className="flex-1 p-4">
				{scriptsLoaded ? (
					<div ref={containerRef} className="h-full w-full" />
				) : (
					<div className="flex items-center justify-center h-full text-gray-500">
						{strings.preview.loadingAnnona}
					</div>
				)}
			</div>
		</div>
	);
};

export default AnnonaPreview;
