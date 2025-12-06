"use client";

import { useRef, useState } from "react";
import { UI_CONFIG } from "@/lib/config";
import { useModalFocus } from "@/lib/hooks/useModalFocus";
import { useStrings } from "@/lib/i18n/LanguageProvider";
import { Button } from "./ui";

interface SharePopupProps {
	storyId: string;
	manifestUrl: string;
	onClose: () => void;
}

const SharePopup = ({ storyId, manifestUrl, onClose }: SharePopupProps) => {
	const [copied, setCopied] = useState(false);
	const dialogRef = useRef<HTMLDivElement>(null);
	const manifestInputRef = useRef<HTMLInputElement>(null);
	const strings = useStrings();

	useModalFocus(dialogRef, manifestInputRef, onClose);

	const copyManifestUrl = async () => {
		await navigator.clipboard.writeText(manifestUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), UI_CONFIG.sharePopupCopyTimeoutMs);
	};

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-40 bg-black/40"
				onClick={onClose}
				aria-hidden="true"
			/>
			<div
				ref={dialogRef}
				className="absolute top-14 right-4 bg-white border rounded-lg shadow-lg p-4 z-50 w-96"
				role="dialog"
				aria-modal="true"
				aria-labelledby="share-dialog-title"
				aria-describedby="share-dialog-description"
				tabIndex={-1}
			>
				<div className="flex items-center justify-between mb-2">
					<h3 className="font-medium" id="share-dialog-title">
						{strings.sharePopup.title}
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cogapp-lavender rounded"
						aria-label={strings.common.close}
					>
						✕
					</button>
				</div>
				<div className="flex gap-2">
					<input
						type="text"
						value={manifestUrl}
						readOnly
						aria-label={strings.sharePopup.title}
						ref={manifestInputRef}
						className="flex-1 px-3 py-2 border rounded text-sm bg-gray-50"
					/>
					<Button onClick={copyManifestUrl}>
						{copied ? strings.sharePopup.copied : strings.sharePopup.copy}
					</Button>
				</div>
				<p className="text-xs text-gray-500 mt-2" id="share-dialog-description">
					{strings.sharePopup.instructions}
				</p>
				<div className="mt-3 pt-3 border-t">
					<p className="text-xs text-gray-500 mb-2">
						{strings.sharePopup.previewHeading}
					</p>
					<div className="flex gap-2 flex-wrap">
						<a
							href={`/preview/storiiies/${storyId}`}
							className="flex-1 px-3 py-2 text-sm text-center border rounded hover:bg-gray-50"
						>
							{strings.viewers.storiiies}
						</a>
						<a
							href={`/preview/clover/${storyId}`}
							className="flex-1 px-3 py-2 text-sm text-center border rounded hover:bg-gray-50"
						>
							{strings.viewers.clover}
						</a>
						<a
							href={`/preview/mirador/${storyId}`}
							className="flex-1 px-3 py-2 text-sm text-center border rounded hover:bg-gray-50"
						>
							{strings.viewers.mirador}
						</a>
						<a
							href={`/preview/annona/${storyId}`}
							className="flex-1 px-3 py-2 text-sm text-center border rounded hover:bg-gray-50"
						>
							{strings.viewers.annona}
						</a>
					</div>
				</div>
			</div>
		</>
	);
};

export default SharePopup;
