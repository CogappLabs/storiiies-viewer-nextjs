import Link from "next/link";
import { Header } from "@/components/ui";
import { getStories } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminStoriiies() {
	const stories = await getStories();

	return (
		<div className="min-h-screen bg-cogapp-cream">
			<Header
				title="All Storiiies"
				backLink={{ href: "/admin", label: "Admin" }}
				actions={
					<span className="text-cogapp-cream">{stories.length} stories</span>
				}
			/>
			<main className="max-w-6xl mx-auto px-4 py-8">
				{stories.length === 0 ? (
					<div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
						No stories in the database yet.
					</div>
				) : (
					<div className="bg-white rounded-lg shadow overflow-hidden">
						<table className="w-full">
							<thead className="bg-gray-50 border-b">
								<tr>
									<th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
										Title
									</th>
									<th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
										Author
									</th>
									<th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
										Annotations
									</th>
									<th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
										Created
									</th>
									<th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
										ID
									</th>
									<th className="px-4 py-3"></th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{stories.map((story) => (
									<tr key={story.id} className="hover:bg-gray-50">
										<td className="px-4 py-3 font-medium">{story.title}</td>
										<td className="px-4 py-3 text-gray-600">
											{story.author || "—"}
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
													className="text-sm text-blue-600 hover:underline"
												>
													Edit
												</Link>
												<Link
													href={`/preview/storiiies/${story.id}`}
													className="text-sm text-green-600 hover:underline"
												>
													Storiiies
												</Link>
												<Link
													href={`/preview/clover/${story.id}`}
													className="text-sm text-purple-600 hover:underline"
												>
													Clover
												</Link>
												<Link
													href={`/preview/mirador/${story.id}`}
													className="text-sm text-orange-600 hover:underline"
												>
													Mirador
												</Link>
												<Link
													href={`/preview/annona/${story.id}`}
													className="text-sm text-pink-600 hover:underline"
												>
													Annona
												</Link>
												<a
													href={`/api/manifest/${story.id}`}
													target="_blank"
													className="text-sm text-gray-500 hover:underline"
												>
													Manifest
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
