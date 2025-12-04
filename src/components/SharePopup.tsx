"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui";

interface SharePopupProps {
	storyId: string;
	manifestUrl: string;
	onClose: () => void;
}

const SharePopup = ({ storyId, manifestUrl, onClose }: SharePopupProps) => {
	const [copied, setCopied] = useState(false);

	// Close on Escape key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	const copyManifestUrl = async () => {
		await navigator.clipboard.writeText(manifestUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="absolute top-14 right-4 bg-white border rounded-lg shadow-lg p-4 z-50 w-96">
			<div className="flex items-center justify-between mb-2">
				<h3 className="font-medium" id="share-dialog-title">
					IIIF Manifest URL
				</h3>
				<button
					type="button"
					onClick={onClose}
					className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
					aria-label="Close share dialog"
				>
					✕
				</button>
			</div>
			<div className="flex gap-2">
				<input
					type="text"
					value={manifestUrl}
					readOnly
					aria-label="IIIF Manifest URL"
					className="flex-1 px-3 py-2 border rounded text-sm bg-gray-50"
				/>
				<Button onClick={copyManifestUrl}>{copied ? "Copied!" : "Copy"}</Button>
			</div>
			<p className="text-xs text-gray-500 mt-2">
				Use this URL to view your story in any IIIF-compatible viewer.
			</p>
			<div className="mt-3 pt-3 border-t">
				<p className="text-xs text-gray-500 mb-2">Preview in:</p>
				<div className="flex gap-2 flex-wrap">
					<a
						href={`/preview/storiiies/${storyId}`}
						className="flex-1 px-3 py-2 text-sm text-center border rounded hover:bg-gray-50"
					>
						Storiiies
					</a>
					<a
						href={`/preview/clover/${storyId}`}
						className="flex-1 px-3 py-2 text-sm text-center border rounded hover:bg-gray-50"
					>
						Clover
					</a>
					<a
						href={`/preview/mirador/${storyId}`}
						className="flex-1 px-3 py-2 text-sm text-center border rounded hover:bg-gray-50"
					>
						Mirador
					</a>
					<a
						href={`/preview/annona/${storyId}`}
						className="flex-1 px-3 py-2 text-sm text-center border rounded hover:bg-gray-50"
					>
						Annona
					</a>
				</div>
			</div>
		</div>
	);
};

export default SharePopup;
