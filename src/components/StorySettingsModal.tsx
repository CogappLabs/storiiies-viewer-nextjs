"use client";

import { useRef, useTransition } from "react";
import type { Story } from "@/generated/prisma/client";
import { deleteStory, updateStory } from "@/lib/actions";
import { useModalFocus } from "@/lib/hooks/useModalFocus";
import { useStrings } from "@/lib/i18n/LanguageProvider";
import { Button } from "./ui";

interface StorySettingsModalProps {
	story: Story;
	onClose: () => void;
}

const StorySettingsModal = ({ story, onClose }: StorySettingsModalProps) => {
	const [isPending, startTransition] = useTransition();
	const strings = useStrings();
	const dialogRef = useRef<HTMLDivElement>(null);
	const titleInputRef = useRef<HTMLInputElement>(null);

	useModalFocus(dialogRef, titleInputRef, onClose);

	const handleUpdateStory = (formData: FormData) => {
		startTransition(() => {
			updateStory(story.id, formData);
			onClose();
		});
	};

	const handleDeleteStory = () => {
		if (confirm(strings.storySettings.deleteConfirm)) {
			startTransition(() => {
				deleteStory(story.id);
			});
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center relative">
			<div
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				aria-hidden="true"
			/>
			<div
				ref={dialogRef}
				className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
				role="dialog"
				aria-modal="true"
				aria-labelledby="settings-dialog-title"
				tabIndex={-1}
			>
				<div className="p-4 border-b flex items-center justify-between">
					<h2 className="font-medium" id="settings-dialog-title">
						{strings.storySettings.title}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cogapp-lavender rounded"
						aria-label={strings.common.close}
					>
						✕
					</button>
				</div>
				<form action={handleUpdateStory} className="p-4 space-y-4">
					<div>
						<label
							htmlFor="story-title"
							className="block text-sm font-medium mb-1"
						>
							{strings.storySettings.titleLabel}
						</label>
						<input
							id="story-title"
							name="title"
							defaultValue={story.title}
							ref={titleInputRef}
							className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cogapp-lavender"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="story-author"
							className="block text-sm font-medium mb-1"
						>
							{strings.storySettings.authorLabel}
						</label>
						<input
							id="story-author"
							name="author"
							defaultValue={story.author || ""}
							className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cogapp-lavender"
						/>
					</div>
					<div>
						<label
							htmlFor="story-description"
							className="block text-sm font-medium mb-1"
						>
							{strings.storySettings.descriptionLabel}
						</label>
						<textarea
							id="story-description"
							name="description"
							defaultValue={story.description || ""}
							className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cogapp-lavender"
							rows={3}
						/>
					</div>
					<div>
						<label
							htmlFor="story-attribution"
							className="block text-sm font-medium mb-1"
						>
							{strings.storySettings.attributionLabel}
						</label>
						<input
							id="story-attribution"
							name="attribution"
							defaultValue={story.attribution || ""}
							className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cogapp-lavender"
						/>
					</div>
					<div className="flex justify-between pt-4 border-t">
						<Button variant="danger" onClick={handleDeleteStory}>
							{strings.storySettings.deleteButton}
						</Button>
						<Button type="submit" disabled={isPending}>
							{strings.storySettings.saveButton}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default StorySettingsModal;
