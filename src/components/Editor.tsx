"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type {
	Annotation,
	AnnotationImage,
	Story,
} from "@/generated/prisma/client";
import { useStrings } from "@/lib/i18n/LanguageProvider";
import type { AnnotatedViewerHandle } from "./AnnotatedViewer";

type AnnotationWithImages = Annotation & { images: AnnotationImage[] };

import AnnotationList from "./AnnotationList";
import NewAnnotationForm from "./NewAnnotationForm";
import SharePopup from "./SharePopup";
import StorySettingsModal from "./StorySettingsModal";
import { Button, Header } from "./ui";

// Dynamic import for the viewer (uses OpenSeadragon which needs window)
const AnnotatedViewer = dynamic(() => import("./AnnotatedViewer"), {
	ssr: false,
	loading: () => (
		<div className="h-full w-full flex items-center justify-center bg-gray-100">
			Loading viewer...
		</div>
	),
});

interface Props {
	story: Story & { annotations: AnnotationWithImages[] };
}

const Editor = ({ story }: Props) => {
	const viewerRef = useRef<AnnotatedViewerHandle>(null);
	const [selectedAnnotationId, setSelectedAnnotationId] = useState<
		string | null
	>(null);
	const [showSettings, setShowSettings] = useState(false);
	const [showManifestLink, setShowManifestLink] = useState(false);
	const [manifestUrl, setManifestUrl] = useState("");
	const [showCrosshairs, setShowCrosshairs] = useState(false);
	const [pendingData, setPendingData] = useState<{
		rect: { x: number; y: number; width: number; height: number };
		viewport: { x: number; y: number; width: number; height: number };
	} | null>(null);
	const strings = useStrings();

	useEffect(() => {
		if (typeof window !== "undefined") {
			setManifestUrl(`${window.location.origin}/api/manifest/${story.id}`);
		}
	}, [story.id]);

	const handleAddAnnotation = () => {
		const bounds = viewerRef.current?.getViewportBounds();
		if (bounds) {
			setPendingData(bounds);
		}
	};

	return (
		<div className="h-screen flex flex-col">
			<Header
				title={story.title}
				backLink={{ href: "/", label: strings.common.back }}
				fullWidth
				actions={
					<>
						<Button
							variant="secondary"
							onClick={() => setShowManifestLink(!showManifestLink)}
							aria-expanded={showManifestLink}
							aria-haspopup="dialog"
						>
							{strings.editor.previewButton}
						</Button>
						<Button
							variant="secondary"
							onClick={() => setShowSettings(!showSettings)}
							aria-expanded={showSettings}
							aria-haspopup="dialog"
						>
							{strings.editor.settingsButton}
						</Button>
					</>
				}
			/>

			{showManifestLink && (
				<SharePopup
					storyId={story.id}
					manifestUrl={manifestUrl}
					onClose={() => setShowManifestLink(false)}
				/>
			)}

			{/* Main content */}
			<div className="flex-1 flex overflow-hidden">
				{/* Sidebar - Left side */}
				<aside
					className="w-80 border-r bg-white flex flex-col"
					aria-label={strings.editor.sidebarLabel}
				>
					<div className="p-4 border-b flex items-center justify-between">
						<h2 className="font-medium">{strings.editor.annotationsHeading}</h2>
						<Button onClick={handleAddAnnotation}>
							{strings.editor.addButton}
						</Button>
					</div>

					<div className="flex-1 overflow-y-auto p-4">
						{pendingData && (
							<NewAnnotationForm
								storyId={story.id}
								pendingData={pendingData}
								onSave={() => setPendingData(null)}
								onCancel={() => setPendingData(null)}
							/>
						)}

						<AnnotationList
							storyId={story.id}
							annotations={story.annotations}
							selectedId={selectedAnnotationId}
							onSelect={setSelectedAnnotationId}
						/>
					</div>
				</aside>

				{/* Viewer */}
				<div className="flex-1 relative">
					<AnnotatedViewer
						ref={viewerRef}
						imageUrl={story.imageUrl}
						imageWidth={story.imageWidth}
						imageHeight={story.imageHeight}
						annotations={story.annotations}
						onAnnotationSelect={setSelectedAnnotationId}
						selectedAnnotationId={selectedAnnotationId}
						showCrosshairs={showCrosshairs}
						onToggleCrosshairs={() => setShowCrosshairs(!showCrosshairs)}
					/>
				</div>
			</div>

			{showSettings && (
				<StorySettingsModal
					story={story}
					onClose={() => setShowSettings(false)}
				/>
			)}
		</div>
	);
};

export default Editor;
