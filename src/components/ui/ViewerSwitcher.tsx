"use client";

import { useStrings } from "@/lib/i18n/LanguageProvider";
import { ButtonLink } from "./Button";

interface ViewerSwitcherProps {
	storyId: string;
	current: "storiiies" | "clover" | "mirador" | "annona";
}

const ViewerSwitcher = ({ storyId, current }: ViewerSwitcherProps) => {
	const strings = useStrings();
	const viewers = [
		{ id: "storiiies", label: strings.viewers.storiiies },
		{ id: "clover", label: strings.viewers.clover },
		{ id: "mirador", label: strings.viewers.mirador },
		{ id: "annona", label: strings.viewers.annona },
	] as const;

	return (
		<>
			{viewers
				.filter((v) => v.id !== current)
				.map((viewer) => (
					<ButtonLink
						key={viewer.id}
						href={`/preview/${viewer.id}/${storyId}`}
						className="min-w-24 justify-center"
					>
						{viewer.label}
					</ButtonLink>
				))}
		</>
	);
};

export default ViewerSwitcher;
