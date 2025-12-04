"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type {
	Annotation,
	AnnotationImage,
	Story,
} from "@/generated/prisma/client";

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
	const [selectedAnnotationId, setSelectedAnnotationId] = useState<
		string | null
	>(null);
	const [drawingEnabled, setDrawingEnabled] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [showManifestLink, setShowManifestLink] = useState(false);
	const [manifestUrl, setManifestUrl] = useState("");
	const [pendingData, setPendingData] = useState<{
		rect: { x: number; y: number; width: number; height: number };
		viewport: { x: number; y: number; width: number; height: number };
	} | null>(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setManifestUrl(`${window.location.origin}/api/manifest/${story.id}`);
		}
	}, [story.id]);

	const handleAnnotationCreate = (data: {
		rect: { x: number; y: number; width: number; height: number };
		viewport: { x: number; y: number; width: number; height: number };
	}) => {
		setPendingData(data);
		setDrawingEnabled(false);
	};

	return (
		<div className="h-screen flex flex-col">
			<Header
				title={story.title}
				backLink={{ href: "/", label: "Back" }}
				fullWidth
				actions={
					<>
						<Button
							variant="secondary"
							onClick={() => setShowManifestLink(!showManifestLink)}
							aria-expanded={showManifestLink}
							aria-haspopup="dialog"
						>
							Share
						</Button>
						<Button
							variant="secondary"
							onClick={() => setShowSettings(!showSettings)}
							aria-expanded={showSettings}
							aria-haspopup="dialog"
						>
							Settings
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
					aria-label="Annotations sidebar"
				>
					<div className="p-4 border-b flex items-center justify-between">
						<h2 className="font-medium">Annotations</h2>
						<button
							type="button"
							onClick={() => setDrawingEnabled(!drawingEnabled)}
							className={`px-3 pt-2 pb-1.5 text-base font-medium leading-7 border focus:outline-none focus:ring-2 focus:ring-cogapp-blue focus:ring-offset-2 transition-colors ${
								drawingEnabled
									? "bg-cogapp-charcoal text-cogapp-cream border-cogapp-charcoal"
									: "bg-cogapp-cream text-cogapp-charcoal border-cogapp-charcoal hover:bg-cogapp-charcoal hover:text-cogapp-cream"
							}`}
							aria-pressed={drawingEnabled}
						>
							{drawingEnabled ? "Drawing..." : "Add"}
						</button>
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
						imageUrl={`${story.imageUrl}/full/max/0/default.jpg`}
						imageWidth={story.imageWidth}
						imageHeight={story.imageHeight}
						annotations={story.annotations}
						onAnnotationCreate={handleAnnotationCreate}
						onAnnotationSelect={setSelectedAnnotationId}
						selectedAnnotationId={selectedAnnotationId}
						drawingEnabled={drawingEnabled}
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
