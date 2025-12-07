import Link from "next/link";
import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Header } from "@/components/ui";
import { getStory, isStoryDeleted } from "@/lib/actions";
import { getStrings } from "@/lib/i18n/strings";

export const dynamic = "force-dynamic";

const EditorPage = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;
	const story = await getStory(id);
	const strings = getStrings();

	if (!story) {
		const deleted = await isStoryDeleted(id);
		if (deleted) {
			return (
				<div className="min-h-screen bg-cogapp-cream">
					<Header
						title={strings.editor.deletedTitle}
						backLink={{ href: "/", label: strings.common.back }}
					/>
					<main className="max-w-2xl mx-auto px-4 py-16 text-center">
						<div className="bg-white rounded-lg shadow p-8">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{strings.editor.deletedHeading}
							</h2>
							<p className="text-gray-600 mb-6">
								{strings.editor.deletedMessage}
							</p>
							<Link
								href="/"
								className="inline-block px-4 py-2 bg-cogapp-charcoal text-white rounded hover:bg-cogapp-charcoal/90"
							>
								{strings.editor.deletedBackHome}
							</Link>
						</div>
					</main>
				</div>
			);
		}
		notFound();
	}

	return (
		<ErrorBoundary>
			<Editor story={story} />
		</ErrorBoundary>
	);
};

export default EditorPage;
