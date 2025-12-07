"use client";

import { restoreStory } from "@/lib/actions";
import { useStrings } from "@/lib/i18n/LanguageProvider";

interface RestoreStoryButtonProps {
	storyId: string;
}

const RestoreStoryButton = ({ storyId }: RestoreStoryButtonProps) => {
	const strings = useStrings();

	const handleRestore = async () => {
		await restoreStory(storyId);
	};

	return (
		<button
			type="button"
			onClick={handleRestore}
			className="text-sm text-green-600 hover:underline"
		>
			{strings.admin.actionLabels.restore}
		</button>
	);
};

export default RestoreStoryButton;
