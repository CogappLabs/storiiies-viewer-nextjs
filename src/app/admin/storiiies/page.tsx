import Link from "next/link";
import DeleteStoryButton from "@/components/DeleteStoryButton";
import RestoreStoryButton from "@/components/RestoreStoryButton";
import { Header } from "@/components/ui";
import { getAllStories } from "@/lib/actions";
import { getStrings } from "@/lib/i18n/strings";

export const dynamic = "force-dynamic";

const isDev = process.env.NODE_ENV === "development";

export default async function AdminStoriiies() {
	const stories = await getAllStories();
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
								{stories.map((story) => {
									const isDeleted = story.deletedAt !== null;
									return (
										<tr
											key={story.id}
											className={
												isDeleted
													? "bg-red-50 hover:bg-red-100"
													: "hover:bg-gray-50"
											}
										>
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
											<td className="px-4 py-3 text-gray-600 text-sm">
												{new Date(story.updatedAt).toLocaleDateString()}
											</td>
											<td className="px-4 py-3 text-gray-500 text-xs font-mono">
												{story.id}
											</td>
											<td className="px-4 py-3">
												<div className="flex flex-col gap-1">
													<span
														className={`text-xs font-medium px-2 py-1 rounded w-fit ${
															isDeleted
																? "bg-red-100 text-red-700"
																: "bg-green-100 text-green-700"
														}`}
													>
														{isDeleted
															? strings.admin.status.deleted
															: strings.admin.status.active}
													</span>
													{isDeleted && story.deletedAt && (
														<span className="text-xs text-gray-500">
															{new Date(story.deletedAt).toLocaleDateString()}
														</span>
													)}
												</div>
											</td>
											<td className="px-4 py-3">
												<div className="flex gap-2 justify-end">
													{isDeleted ? (
														<RestoreStoryButton storyId={story.id} />
													) : (
														<>
															<Link
																href={`/editor/${story.id}`}
																className="text-sm text-cogapp-charcoal hover:underline"
															>
																{strings.admin.actionLabels.edit}
															</Link>
															{isDev && (
																<DeleteStoryButton storyId={story.id} />
															)}
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
														</>
													)}
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</main>
		</div>
	);
}
