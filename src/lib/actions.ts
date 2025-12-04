"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Story } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type StoryWithCount = Story & { _count: { annotations: number } };

// Helper to safely get string from FormData
const getString = (formData: FormData, key: string): string => {
	const value = formData.get(key);
	if (typeof value !== "string") {
		throw new Error(`Missing or invalid field: ${key}`);
	}
	return value;
};

const getOptionalString = (formData: FormData, key: string): string | null => {
	const value = formData.get(key);
	if (value === null || value === "") return null;
	if (typeof value !== "string") return null;
	return value;
};

const getPositiveInt = (formData: FormData, key: string): number => {
	const value = formData.get(key);
	if (typeof value !== "string") {
		throw new Error(`Missing or invalid field: ${key}`);
	}
	const num = parseInt(value, 10);
	if (Number.isNaN(num) || num <= 0) {
		throw new Error(`${key} must be a positive number`);
	}
	return num;
};

// Validate URL format (basic check)
const isValidUrl = (url: string): boolean => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

// Validate annotation coordinates
const validateCoordinates = (coords: {
	x?: number;
	y?: number;
	width?: number;
	height?: number;
}): void => {
	const { x, y, width, height } = coords;

	if (
		x !== undefined &&
		(typeof x !== "number" || !Number.isFinite(x) || x < 0)
	) {
		throw new Error("x coordinate must be a non-negative number");
	}
	if (
		y !== undefined &&
		(typeof y !== "number" || !Number.isFinite(y) || y < 0)
	) {
		throw new Error("y coordinate must be a non-negative number");
	}
	if (
		width !== undefined &&
		(typeof width !== "number" || !Number.isFinite(width) || width <= 0)
	) {
		throw new Error("width must be a positive number");
	}
	if (
		height !== undefined &&
		(typeof height !== "number" || !Number.isFinite(height) || height <= 0)
	) {
		throw new Error("height must be a positive number");
	}
};

const NEXT_REDIRECT_MESSAGE = "NEXT_REDIRECT";

const handleActionError = (scope: string, error: unknown): never => {
	if (error instanceof Error && error.message === NEXT_REDIRECT_MESSAGE) {
		throw error;
	}

	const fallback = `Failed to ${scope}`;
	console.error(`${fallback}:`, error);

	if (error instanceof Error) {
		throw error;
	}

	throw new Error(fallback);
};

// Story actions
export const createStory = async (formData: FormData) => {
	try {
		const title = getString(formData, "title");
		if (!title.trim()) {
			throw new Error("Title is required");
		}

		const author = getOptionalString(formData, "author");
		const description = getOptionalString(formData, "description");
		const attribution = getOptionalString(formData, "attribution");
		const imageUrl = getString(formData, "imageUrl");

		if (!isValidUrl(imageUrl)) {
			throw new Error("Invalid image URL");
		}

		const imageWidth = getPositiveInt(formData, "imageWidth");
		const imageHeight = getPositiveInt(formData, "imageHeight");

		const story = await prisma.story.create({
			data: {
				title: title.trim(),
				author: author?.trim() || null,
				description: description?.trim() || null,
				attribution: attribution?.trim() || null,
				imageUrl,
				imageWidth,
				imageHeight,
			},
		});

		redirect(`/editor/${story.id}`);
	} catch (error) {
		handleActionError("create story", error);
	}
};

export const updateStory = async (id: string, formData: FormData) => {
	try {
		if (!id) {
			throw new Error("Story ID is required");
		}

		const title = getString(formData, "title");
		if (!title.trim()) {
			throw new Error("Title is required");
		}

		const author = getOptionalString(formData, "author");
		const description = getOptionalString(formData, "description");
		const attribution = getOptionalString(formData, "attribution");

		await prisma.story.update({
			where: { id },
			data: {
				title: title.trim(),
				author: author?.trim() || null,
				description: description?.trim() || null,
				attribution: attribution?.trim() || null,
			},
		});

		revalidatePath(`/editor/${id}`);
	} catch (error) {
		handleActionError("update story", error);
	}
};

export const deleteStory = async (id: string) => {
	try {
		if (!id) {
			throw new Error("Story ID is required");
		}

		await prisma.story.delete({ where: { id } });
		revalidatePath("/");
		redirect("/");
	} catch (error) {
		handleActionError("delete story", error);
	}
};

export const getStories = async (): Promise<StoryWithCount[]> => {
	try {
		return await prisma.story.findMany({
			orderBy: { updatedAt: "desc" },
			include: {
				_count: { select: { annotations: true } },
			},
		});
	} catch (error) {
		handleActionError("fetch stories", error);
		throw error;
	}
};

export const getStory = async (id: string) => {
	try {
		if (!id) {
			throw new Error("Story ID is required");
		}

		return await prisma.story.findUnique({
			where: { id },
			include: {
				annotations: {
					orderBy: { ordinal: "asc" },
					include: {
						images: { orderBy: { ordinal: "asc" } },
					},
				},
			},
		});
	} catch (error) {
		handleActionError("fetch story", error);
		throw error;
	}
};

// Annotation actions
export const createAnnotation = async (
	storyId: string,
	data: {
		text: string;
		x: number;
		y: number;
		width: number;
		height: number;
		viewportX?: number;
		viewportY?: number;
		viewportWidth?: number;
		viewportHeight?: number;
		imageUrls?: string[];
	},
) => {
	try {
		if (!storyId) {
			throw new Error("Story ID is required");
		}

		// Validate coordinates
		validateCoordinates({
			x: data.x,
			y: data.y,
			width: data.width,
			height: data.height,
		});

		// Also validate viewport coordinates if provided
		if (
			data.viewportX !== undefined ||
			data.viewportY !== undefined ||
			data.viewportWidth !== undefined ||
			data.viewportHeight !== undefined
		) {
			validateCoordinates({
				x: data.viewportX,
				y: data.viewportY,
				width: data.viewportWidth,
				height: data.viewportHeight,
			});
		}

		// Validate image URLs if provided
		const validImageUrls = data.imageUrls?.filter((url) => {
			if (!url.trim()) return false;
			return isValidUrl(url);
		});

		const maxOrdinal = await prisma.annotation.aggregate({
			where: { storyId },
			_max: { ordinal: true },
		});

		const annotation = await prisma.annotation.create({
			data: {
				storyId,
				text: data.text,
				x: data.x,
				y: data.y,
				width: data.width,
				height: data.height,
				viewportX: data.viewportX,
				viewportY: data.viewportY,
				viewportWidth: data.viewportWidth,
				viewportHeight: data.viewportHeight,
				ordinal: (maxOrdinal._max.ordinal ?? -1) + 1,
				images: validImageUrls?.length
					? {
							create: validImageUrls.map((url, index) => ({
								imageUrl: url,
								ordinal: index,
							})),
						}
					: undefined,
			},
			include: {
				images: { orderBy: { ordinal: "asc" } },
			},
		});

		revalidatePath(`/editor/${storyId}`);
		return annotation;
	} catch (error) {
		handleActionError("create annotation", error);
	}
};

export const updateAnnotation = async (
	id: string,
	storyId: string,
	data: {
		text?: string;
		x?: number;
		y?: number;
		width?: number;
		height?: number;
	},
) => {
	try {
		if (!id || !storyId) {
			throw new Error("Annotation ID and Story ID are required");
		}

		// Validate coordinates if provided
		validateCoordinates({
			x: data.x,
			y: data.y,
			width: data.width,
			height: data.height,
		});

		const annotation = await prisma.annotation.update({
			where: { id },
			data,
		});

		revalidatePath(`/editor/${storyId}`);
		return annotation;
	} catch (error) {
		handleActionError("update annotation", error);
	}
};

export const deleteAnnotation = async (id: string, storyId: string) => {
	try {
		if (!id || !storyId) {
			throw new Error("Annotation ID and Story ID are required");
		}

		await prisma.annotation.delete({ where: { id } });
		revalidatePath(`/editor/${storyId}`);
	} catch (error) {
		handleActionError("delete annotation", error);
	}
};

export const reorderAnnotations = async (
	storyId: string,
	annotationIds: string[],
) => {
	try {
		if (!storyId) {
			throw new Error("Story ID is required");
		}

		if (!Array.isArray(annotationIds) || annotationIds.length === 0) {
			throw new Error("Annotation IDs are required");
		}

		await prisma.$transaction(
			annotationIds.map((id, index) =>
				prisma.annotation.update({
					where: { id },
					data: { ordinal: index },
				}),
			),
		);

		revalidatePath(`/editor/${storyId}`);
	} catch (error) {
		handleActionError("reorder annotations", error);
	}
};

// Annotation Image actions
export const addAnnotationImage = async (
	annotationId: string,
	storyId: string,
	imageUrl: string,
) => {
	try {
		if (!annotationId || !storyId) {
			throw new Error("Annotation ID and Story ID are required");
		}

		if (!imageUrl || !isValidUrl(imageUrl)) {
			throw new Error("Valid image URL is required");
		}

		const maxOrdinal = await prisma.annotationImage.aggregate({
			where: { annotationId },
			_max: { ordinal: true },
		});

		await prisma.annotationImage.create({
			data: {
				annotationId,
				imageUrl,
				ordinal: (maxOrdinal._max.ordinal ?? -1) + 1,
			},
		});

		revalidatePath(`/editor/${storyId}`);
	} catch (error) {
		handleActionError("add annotation image", error);
	}
};

export const removeAnnotationImage = async (
	imageId: string,
	storyId: string,
) => {
	try {
		if (!imageId || !storyId) {
			throw new Error("Image ID and Story ID are required");
		}

		await prisma.annotationImage.delete({ where: { id: imageId } });
		revalidatePath(`/editor/${storyId}`);
	} catch (error) {
		handleActionError("remove annotation image", error);
	}
};

export const updateAnnotationImages = async (
	annotationId: string,
	storyId: string,
	imageUrls: string[],
) => {
	try {
		if (!annotationId || !storyId) {
			throw new Error("Annotation ID and Story ID are required");
		}

		// Filter and validate URLs
		const validUrls = imageUrls.filter((url) => url.trim() && isValidUrl(url));

		// Delete all existing images and recreate with new order
		await prisma.$transaction([
			prisma.annotationImage.deleteMany({ where: { annotationId } }),
			...validUrls.map((url, index) =>
				prisma.annotationImage.create({
					data: {
						annotationId,
						imageUrl: url,
						ordinal: index,
					},
				}),
			),
		]);

		revalidatePath(`/editor/${storyId}`);
	} catch (error) {
		handleActionError("update annotation images", error);
	}
};
