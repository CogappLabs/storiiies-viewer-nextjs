import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import ErrorBoundary from "@/components/ErrorBoundary";
import { getStory } from "@/lib/actions";

export const dynamic = "force-dynamic";

const EditorPage = async ({
	params,
}: {
	params: Promise<{ id: string }>;
}) => {
	const { id } = await params;
	const story = await getStory(id);

	if (!story) {
		notFound();
	}

	return (
		<ErrorBoundary>
			<Editor story={story} />
		</ErrorBoundary>
	);
};

export default EditorPage;
