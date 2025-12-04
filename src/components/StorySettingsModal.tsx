"use client";

import { useEffect, useTransition } from "react";
import type { Story } from "@/generated/prisma/client";
import { deleteStory, updateStory } from "@/lib/actions";
import { Button } from "./ui";

interface StorySettingsModalProps {
	story: Story;
	onClose: () => void;
}

const StorySettingsModal = ({ story, onClose }: StorySettingsModalProps) => {
	const [isPending, startTransition] = useTransition();

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

	const handleUpdateStory = (formData: FormData) => {
		startTransition(() => {
			updateStory(story.id, formData);
			onClose();
		});
	};

	const handleDeleteStory = () => {
		if (
			confirm(
				"Are you sure you want to delete this story? This cannot be undone.",
			)
		) {
			startTransition(() => {
				deleteStory(story.id);
			});
		}
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
			role="dialog"
			aria-modal="true"
			aria-labelledby="settings-dialog-title"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="p-4 border-b flex items-center justify-between">
					<h2 className="font-medium" id="settings-dialog-title">
						Story Settings
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
						aria-label="Close settings"
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
							Title
						</label>
						<input
							id="story-title"
							name="title"
							defaultValue={story.title}
							className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cogapp-blue"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="story-author"
							className="block text-sm font-medium mb-1"
						>
							Author
						</label>
						<input
							id="story-author"
							name="author"
							defaultValue={story.author || ""}
							className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cogapp-blue"
						/>
					</div>
					<div>
						<label
							htmlFor="story-description"
							className="block text-sm font-medium mb-1"
						>
							Description
						</label>
						<textarea
							id="story-description"
							name="description"
							defaultValue={story.description || ""}
							className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cogapp-blue"
							rows={3}
						/>
					</div>
					<div>
						<label
							htmlFor="story-attribution"
							className="block text-sm font-medium mb-1"
						>
							Attribution
						</label>
						<input
							id="story-attribution"
							name="attribution"
							defaultValue={story.attribution || ""}
							className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cogapp-blue"
						/>
					</div>
					<div className="flex justify-between pt-4 border-t">
						<Button variant="danger" onClick={handleDeleteStory}>
							Delete Story
						</Button>
						<Button type="submit" disabled={isPending}>
							Save Changes
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default StorySettingsModal;
