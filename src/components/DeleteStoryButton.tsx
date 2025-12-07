"use client";

import { deleteStory } from "@/lib/actions";
import { useStrings } from "@/lib/i18n/LanguageProvider";

interface DeleteStoryButtonProps {
	storyId: string;
}

const DeleteStoryButton = ({ storyId }: DeleteStoryButtonProps) => {
	const strings = useStrings();

	const handleDelete = async () => {
		if (confirm(strings.storySettings.deleteConfirm)) {
			await deleteStory(storyId);
		}
	};

	return (
		<button
			type="button"
			onClick={handleDelete}
			className="text-sm text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
		>
			{strings.admin.actionLabels.delete}
		</button>
	);
};

export default DeleteStoryButton;
