"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

	if (x !== undefined && (typeof x !== "number" || !Number.isFinite(x) || x < 0)) {
		throw new Error("x coordinate must be a non-negative number");
	}
	if (y !== undefined && (typeof y !== "number" || !Number.isFinite(y) || y < 0)) {
		throw new Error("y coordinate must be a non-negative number");
	}
	if (width !== undefined && (typeof width !== "number" || !Number.isFinite(width) || width <= 0)) {
		throw new Error("width must be a positive number");
	}
	if (height !== undefined && (typeof height !== "number" || !Number.isFinite(height) || height <= 0)) {
		throw new Error("height must be a positive number");
	}
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
		// Re-throw redirect errors (Next.js uses these internally)
		if (error instanceof Error && error.message === "NEXT_REDIRECT") {
			throw error;
		}
		console.error("Failed to create story:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to create story",
		);
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
		console.error("Failed to update story:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to update story",
		);
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
		if (error instanceof Error && error.message === "NEXT_REDIRECT") {
			throw error;
		}
		console.error("Failed to delete story:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to delete story",
		);
	}
};

export const getStories = async () => {
	try {
		return await prisma.story.findMany({
			orderBy: { updatedAt: "desc" },
			include: {
				_count: { select: { annotations: true } },
			},
		});
	} catch (error) {
		console.error("Failed to fetch stories:", error);
		throw new Error("Failed to fetch stories");
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
		console.error("Failed to fetch story:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch story",
		);
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
		if (data.viewportX !== undefined || data.viewportY !== undefined ||
			data.viewportWidth !== undefined || data.viewportHeight !== undefined) {
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
		console.error("Failed to create annotation:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to create annotation",
		);
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
		console.error("Failed to update annotation:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to update annotation",
		);
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
		console.error("Failed to delete annotation:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to delete annotation",
		);
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
		console.error("Failed to reorder annotations:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to reorder annotations",
		);
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
		console.error("Failed to add annotation image:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to add annotation image",
		);
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
		console.error("Failed to remove annotation image:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to remove annotation image",
		);
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
		console.error("Failed to update annotation images:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to update annotation images",
		);
	}
};
