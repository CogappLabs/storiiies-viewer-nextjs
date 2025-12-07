"use client";

import Link from "next/link";
import { useStrings } from "@/lib/i18n/LanguageProvider";

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
					<Link
						key={viewer.id}
						href={`/preview/${viewer.id}/${storyId}`}
						className="px-3 py-1.5 text-sm bg-cogapp-cream text-cogapp-charcoal rounded hover:bg-white focus:outline-none focus:ring-2 focus:ring-cogapp-lavender focus:ring-offset-1"
					>
						{viewer.label}
					</Link>
				))}
		</>
	);
};

export default ViewerSwitcher;
