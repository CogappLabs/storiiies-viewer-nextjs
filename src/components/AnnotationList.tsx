"use client";

import {
	DragDropContext,
	Draggable,
	Droppable,
	type DropResult,
} from "@hello-pangea/dnd";
import Image from "next/image";
import { useState, useTransition } from "react";
import type { Annotation, AnnotationImage } from "@/generated/prisma/client";
import {
	deleteAnnotation,
	reorderAnnotations,
	updateAnnotation,
	updateAnnotationImages,
} from "@/lib/actions";

type AnnotationWithImages = Annotation & { images: AnnotationImage[] };

interface Props {
	storyId: string;
	annotations: AnnotationWithImages[];
	selectedId: string | null;
	onSelect: (id: string | null) => void;
}

const AnnotationList = ({
	storyId,
	annotations,
	selectedId,
	onSelect,
}: Props) => {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editText, setEditText] = useState("");
	const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
	const [isPending, startTransition] = useTransition();

	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return;
		if (result.source.index === result.destination.index) return;

		const items = Array.from(annotations);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		const newOrder = items.map((item) => item.id);

		startTransition(() => {
			reorderAnnotations(storyId, newOrder);
		});
	};

	const startEditing = (annotation: AnnotationWithImages) => {
		setEditingId(annotation.id);
		setEditText(annotation.text);
		setEditImageUrls(annotation.images.map((img) => img.imageUrl));
	};

	const saveEdit = () => {
		if (!editingId) return;

		startTransition(async () => {
			await updateAnnotation(editingId, storyId, { text: editText });
			const filteredUrls = editImageUrls.filter((url) => url.trim() !== "");
			await updateAnnotationImages(editingId, storyId, filteredUrls);
			setEditingId(null);
			setEditText("");
			setEditImageUrls([]);
		});
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditText("");
		setEditImageUrls([]);
	};

	const handleDelete = (id: string) => {
		if (confirm("Delete this annotation?")) {
			startTransition(() => {
				deleteAnnotation(id, storyId);
				if (selectedId === id) {
					onSelect(null);
				}
			});
		}
	};

	if (annotations.length === 0) {
		return (
			<div className="text-gray-500 text-center py-8">
				No annotations yet. Click "Add" and drag on the image to create one.
			</div>
		);
	}

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<Droppable droppableId="annotations">
				{(provided) => (
					<div
						{...provided.droppableProps}
						ref={provided.innerRef}
						className="space-y-2"
					>
						{annotations.map((annotation, index) => (
							<Draggable
								key={annotation.id}
								draggableId={annotation.id}
								index={index}
							>
								{(provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										className={`p-3 rounded-md border ${
											selectedId === annotation.id
												? "border-cogapp-blue bg-cogapp-light-blue"
												: "border-gray-200 bg-white"
										} ${snapshot.isDragging ? "shadow-lg" : ""} ${
											isPending ? "opacity-50" : ""
										}`}
										onClick={() => onSelect(annotation.id)}
									>
										<div className="flex items-start gap-2">
											<div
												{...provided.dragHandleProps}
												className="mt-1 cursor-grab text-gray-400 hover:text-gray-600"
											>
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													aria-hidden="true"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M4 8h16M4 16h16"
													/>
												</svg>
											</div>

											<div className="flex-1 min-w-0">
												<div className="text-xs text-gray-400 mb-1">
													{index + 1}
												</div>

												{editingId === annotation.id ? (
													<div className="space-y-2">
														<textarea
															value={editText}
															onChange={(e) => setEditText(e.target.value)}
															className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
															rows={3}
															autoFocus
														/>
														<div>
															<label className="block text-xs text-gray-500 mb-1">
																Images
															</label>
															{editImageUrls.map((url, index) => (
																<div key={index} className="flex gap-1 mb-1">
																	<input
																		type="url"
																		value={url}
																		onChange={(e) => {
																			const newUrls = [...editImageUrls];
																			newUrls[index] = e.target.value;
																			setEditImageUrls(newUrls);
																		}}
																		className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
																		placeholder="https://example.com/image.jpg"
																	/>
																	<button
																		type="button"
																		onClick={() => {
																			setEditImageUrls(
																				editImageUrls.filter(
																					(_, i) => i !== index,
																				),
																			);
																		}}
																		className="px-1 text-red-600 hover:bg-red-50 rounded text-xs"
																	>
																		x
																	</button>
																</div>
															))}
															<button
																type="button"
																onClick={() =>
																	setEditImageUrls([...editImageUrls, ""])
																}
																className="text-xs text-blue-600 hover:text-blue-800"
															>
																+ Add image
															</button>
														</div>
														<div className="flex gap-2">
															<button
																type="button"
																onClick={saveEdit}
																className="px-2 py-1 bg-cogapp-charcoal text-white text-xs rounded hover:bg-cogapp-charcoal/90 focus:outline-none focus:ring-2 focus:ring-cogapp-blue"
															>
																Save
															</button>
															<button
																type="button"
																onClick={cancelEdit}
																className="px-2 py-1 bg-cogapp-cream text-cogapp-charcoal text-xs rounded hover:bg-white focus:outline-none focus:ring-2 focus:ring-cogapp-blue"
															>
																Cancel
															</button>
														</div>
													</div>
												) : (
													<>
														<p className="text-sm whitespace-pre-wrap">
															{annotation.text || (
																<span className="text-gray-400 italic">
																	No text
																</span>
															)}
														</p>
														{annotation.images.length > 0 && (
															<div className="mt-2 flex flex-wrap gap-1">
																{annotation.images.map((img) => (
																	<Image
																		key={img.id}
																		src={img.imageUrl}
																		alt="Annotation image"
																		width={48}
																		height={48}
																		className="w-12 h-12 object-cover rounded border"
																		unoptimized
																	/>
																))}
															</div>
														)}
														<details className="mt-2 text-xs">
															<summary className="cursor-pointer text-gray-400 hover:text-gray-600">
																Data
															</summary>
															<div className="mt-1 p-2 bg-gray-50 rounded text-gray-500 font-mono space-y-1 break-all overflow-hidden">
																<div>
																	<span className="text-gray-400">rect:</span>{" "}
																	x={Math.round(annotation.x)}, y=
																	{Math.round(annotation.y)}, w=
																	{Math.round(annotation.width)}, h=
																	{Math.round(annotation.height)}
																</div>
																{annotation.viewportX !== null && (
																	<div>
																		<span className="text-gray-400">
																			viewport:
																		</span>{" "}
																		x={Math.round(annotation.viewportX ?? 0)},
																		y=
																		{Math.round(annotation.viewportY ?? 0)}, w=
																		{Math.round(annotation.viewportWidth ?? 0)},
																		h=
																		{Math.round(annotation.viewportHeight ?? 0)}
																	</div>
																)}
																{annotation.images.length > 0 && (
																	<div>
																		<span className="text-gray-400">
																			images:
																		</span>{" "}
																		{annotation.images
																			.map((img) => img.imageUrl)
																			.join(", ")}
																	</div>
																)}
															</div>
														</details>
													</>
												)}
											</div>

											{editingId !== annotation.id && (
												<div className="flex gap-1">
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															startEditing(annotation);
														}}
														className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cogapp-blue rounded"
														aria-label="Edit annotation"
													>
														<svg
															className="w-4 h-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
															aria-hidden="true"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
															/>
														</svg>
													</button>
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															handleDelete(annotation.id);
														}}
														className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
														aria-label="Delete annotation"
													>
														<svg
															className="w-4 h-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
															/>
														</svg>
													</button>
												</div>
											)}
										</div>
									</div>
								)}
							</Draggable>
						))}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
};

export default AnnotationList;
