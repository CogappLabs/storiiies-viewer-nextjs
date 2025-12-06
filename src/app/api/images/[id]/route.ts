import { type NextRequest, NextResponse } from "next/server";
import { deleteDirectory } from "@/lib/blob";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const imageSource = await prisma.imageSource.findUnique({
			where: { id },
			include: {
				story: {
					select: { id: true, title: true },
				},
			},
		});

		if (!imageSource) {
			return NextResponse.json({ error: "Image not found" }, { status: 404 });
		}

		return NextResponse.json({
			id: imageSource.id,
			originalName: imageSource.originalName,
			width: imageSource.width,
			height: imageSource.height,
			sourceType: imageSource.sourceType,
			infoJson: imageSource.infoJsonUrl,
			createdAt: imageSource.createdAt.toISOString(),
			usedBy: imageSource.story
				? { id: imageSource.story.id, title: imageSource.story.title }
				: null,
		});
	} catch (error) {
		console.error("Image fetch error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch image" },
			{ status: 500 },
		);
	}
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const imageSource = await prisma.imageSource.findUnique({
			where: { id },
			include: { story: { select: { id: true, title: true } } },
		});

		if (!imageSource) {
			return NextResponse.json({ error: "Image not found" }, { status: 404 });
		}

		// Prevent deletion if image is being used by a story
		if (imageSource.story) {
			return NextResponse.json(
				{
					error: `Cannot delete image: it is being used by story "${imageSource.story.title}"`,
				},
				{ status: 409 },
			);
		}

		// Only delete blob files for uploaded images
		if (imageSource.sourceType === "upload") {
			await deleteDirectory(`iiif/${id}`);
		}

		await prisma.imageSource.delete({ where: { id } });

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Image delete error:", error);
		return NextResponse.json(
			{ error: "Failed to delete image" },
			{ status: 500 },
		);
	}
}
