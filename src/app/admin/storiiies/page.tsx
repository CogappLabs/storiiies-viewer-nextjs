import Link from "next/link";
import DeleteStoryButton from "@/components/DeleteStoryButton";
import { Header } from "@/components/ui";
import { getStories } from "@/lib/actions";
import { getStrings } from "@/lib/i18n/strings";

export const dynamic = "force-dynamic";

const isDev = process.env.NODE_ENV === "development";

export default async function AdminStoriiies() {
	const stories = await getStories();
	const strings = getStrings();

	return (
		<div className="min-h-screen bg-cogapp-cream">
			<Header
				title={strings.admin.allStoriesTitle}
				backLink={{ href: "/admin", label: strings.common.admin }}
				actions={
					<span className="text-cogapp-cream">
						{strings.admin.storiesCount(stories.length)}
					</span>
				}
			/>
			<main className="max-w-6xl mx-auto px-4 py-8">
				{stories.length === 0 ? (
					<div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
						{strings.admin.noStories}
					</div>
				) : (
					<div className="bg-white rounded-lg shadow overflow-hidden">
						<table className="w-full">
							<thead className="bg-gray-50 border-b">
								<tr>
									{(
										Object.entries(strings.admin.tableHeaders) as [
											keyof typeof strings.admin.tableHeaders,
											string,
										][]
									)
										.filter(([key]) => key !== "actions")
										.map(([, label]) => (
											<th
												key={label}
												className="text-left px-4 py-3 text-sm font-medium text-gray-500"
											>
												{label}
											</th>
										))}
									<th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
										{strings.admin.tableHeaders.actions}
									</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{stories.map((story) => (
									<tr key={story.id} className="hover:bg-gray-50">
										<td className="px-4 py-3 font-medium">{story.title}</td>
										<td className="px-4 py-3 text-gray-600">
											{story.author || strings.admin.noAuthorPlaceholder}
										</td>
										<td className="px-4 py-3 text-gray-600">
											{story._count.annotations}
										</td>
										<td className="px-4 py-3 text-gray-600 text-sm">
											{new Date(story.createdAt).toLocaleDateString()}
										</td>
										<td className="px-4 py-3 text-gray-400 text-xs font-mono">
											{story.id}
										</td>
										<td className="px-4 py-3">
											<div className="flex gap-2 justify-end">
												<Link
													href={`/editor/${story.id}`}
													className="text-sm text-cogapp-charcoal hover:underline"
												>
													{strings.admin.actionLabels.edit}
												</Link>
												{isDev && <DeleteStoryButton storyId={story.id} />}
												<Link
													href={`/preview/storiiies/${story.id}`}
													className="text-sm text-green-600 hover:underline"
												>
													{strings.admin.actionLabels.storiiies}
												</Link>
												<Link
													href={`/preview/clover/${story.id}`}
													className="text-sm text-purple-600 hover:underline"
												>
													{strings.admin.actionLabels.clover}
												</Link>
												<Link
													href={`/preview/mirador/${story.id}`}
													className="text-sm text-orange-600 hover:underline"
												>
													{strings.admin.actionLabels.mirador}
												</Link>
												<Link
													href={`/preview/annona/${story.id}`}
													className="text-sm text-pink-600 hover:underline"
												>
													{strings.admin.actionLabels.annona}
												</Link>
												<a
													href={`/api/manifest/${story.id}`}
													target="_blank"
													className="text-sm text-gray-500 hover:underline"
												>
													{strings.admin.actionLabels.manifest}
												</a>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</main>
		</div>
	);
}
