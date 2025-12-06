import { type NextRequest, NextResponse } from "next/server";
import { getBlobBaseUrl, uploadDirectory } from "@/lib/blob";
import { cleanupTempDir, generateIIIFTiles } from "@/lib/iiif";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("image") as File | null;

		if (!file) {
			return NextResponse.json(
				{ error: "No image file provided" },
				{ status: 400 },
			);
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const imageId = crypto.randomUUID();
		const blobBaseUrl = getBlobBaseUrl();

		const { tempDir, tileDir, width, height } = await generateIIIFTiles(
			buffer,
			imageId,
			blobBaseUrl,
		);

		try {
			await uploadDirectory(tileDir, `iiif/${imageId}`);
		} finally {
			await cleanupTempDir(tempDir);
		}

		const infoJsonUrl = `${blobBaseUrl}/iiif/${imageId}/info.json`;

		const imageSource = await prisma.imageSource.create({
			data: {
				id: imageId,
				infoJsonUrl,
				width,
				height,
				sourceType: "upload",
				originalName: file.name,
			},
		});

		return NextResponse.json({
			id: imageSource.id,
			originalName: imageSource.originalName,
			width: imageSource.width,
			height: imageSource.height,
			infoJson: infoJsonUrl,
		});
	} catch (error) {
		console.error("Image upload error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to upload image",
			},
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const imageSources = await prisma.imageSource.findMany({
			where: { sourceType: "upload" },
			orderBy: { createdAt: "desc" },
			include: {
				story: {
					select: { id: true, title: true },
				},
			},
		});

		return NextResponse.json({
			images: imageSources.map((imageSource) => ({
				id: imageSource.id,
				originalName: imageSource.originalName,
				width: imageSource.width,
				height: imageSource.height,
				infoJson: imageSource.infoJsonUrl,
				createdAt: imageSource.createdAt.toISOString(),
				usedBy: imageSource.story
					? { id: imageSource.story.id, title: imageSource.story.title }
					: null,
			})),
		});
	} catch (error) {
		console.error("Image list error:", error);
		return NextResponse.json(
			{ error: "Failed to list images" },
			{ status: 500 },
		);
	}
}
