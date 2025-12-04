import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import { getStory } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditorPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const story = await getStory(id);

	if (!story) {
		notFound();
	}

	return <Editor story={story} />;
}
