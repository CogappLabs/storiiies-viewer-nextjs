import Link from "next/link";
import CreateStoryForm from "@/components/CreateStoryForm";
import { Header } from "@/components/ui";
import { getStories } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
	const stories = await getStories();

	return (
		<div className="min-h-screen bg-cogapp-cream">
			<Header
				title="Storiiies Editor"
				subtitle="Create annotated stories from IIIF images"
			/>

			<main className="max-w-6xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Create new story */}
					<section className="bg-white rounded-lg shadow p-6">
						<h2 className="text-lg font-semibold mb-4">Create New Story</h2>
						<CreateStoryForm />
					</section>

					{/* Existing stories */}
					<section className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold">All Stories</h2>
							<Link
								href="/admin"
								className="text-sm text-cogapp-gray hover:text-cogapp-charcoal"
							>
								Admin →
							</Link>
						</div>

						{stories.length === 0 ? (
							<p className="text-gray-500">
								No stories yet. Create your first one!
							</p>
						) : (
							<div className="space-y-3">
								{stories.map((story) => (
									<Link
										key={story.id}
										href={`/editor/${story.id}`}
										className="block p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
									>
										<h3 className="font-medium">{story.title}</h3>
										{story.author && (
											<p className="text-sm text-gray-500">by {story.author}</p>
										)}
										<div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
											<span>{story._count.annotations} annotations</span>
											<span>
												Updated {new Date(story.updatedAt).toLocaleDateString()}
											</span>
										</div>
									</Link>
								))}
							</div>
						)}
					</section>
				</div>
			</main>
		</div>
	);
}
