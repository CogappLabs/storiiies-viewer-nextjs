import Link from "next/link";

interface ViewerSwitcherProps {
	storyId: string;
	current: "storiiies" | "clover" | "mirador" | "annona";
}

const viewers = [
	{ id: "storiiies", label: "Storiiies" },
	{ id: "clover", label: "Clover" },
	{ id: "mirador", label: "Mirador" },
	{ id: "annona", label: "Annona" },
] as const;

const ViewerSwitcher = ({ storyId, current }: ViewerSwitcherProps) => (
	<>
		{viewers
			.filter((v) => v.id !== current)
			.map((viewer) => (
				<Link
					key={viewer.id}
					href={`/preview/${viewer.id}/${storyId}`}
					className="px-3 py-1.5 text-sm bg-cogapp-cream text-cogapp-charcoal rounded hover:bg-white"
				>
					{viewer.label}
				</Link>
			))}
	</>
);

export default ViewerSwitcher;
