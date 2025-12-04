import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const host = request.headers.get("host") || "localhost:3000";
	const protocol = request.headers.get("x-forwarded-proto") || "http";
	const baseUrl = `${protocol}://${host}`;

	const story = await prisma.story.findUnique({
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

	if (!story) {
		return NextResponse.json({ error: "Story not found" }, { status: 404 });
	}

	// Build IIIF Presentation API v3 manifest
	const manifest = {
		"@context": "http://iiif.io/api/presentation/3/context.json",
		id: `${baseUrl}/api/manifest/${story.id}`,
		type: "Manifest",
		label: { en: [story.title] },
		...(story.author && {
			metadata: [{ label: { en: ["Author"] }, value: { en: [story.author] } }],
		}),
		...(story.description && { summary: { en: [story.description] } }),
		...(story.attribution && {
			requiredStatement: {
				label: { en: ["Attribution"] },
				value: { en: [story.attribution] },
			},
		}),
		items: [
			{
				id: `${baseUrl}/api/manifest/${story.id}/canvas/1`,
				type: "Canvas",
				width: story.imageWidth,
				height: story.imageHeight,
				items: [
					{
						id: `${baseUrl}/api/manifest/${story.id}/canvas/1/page`,
						type: "AnnotationPage",
						items: [
							{
								id: `${baseUrl}/api/manifest/${story.id}/canvas/1/page/image`,
								type: "Annotation",
								motivation: "painting",
								body: {
									id: `${story.imageUrl}/full/max/0/default.jpg`,
									type: "Image",
									format: "image/jpeg",
									width: story.imageWidth,
									height: story.imageHeight,
									service: [
										{
											id: story.imageUrl,
											type: "ImageService3",
											profile: "level1",
										},
									],
								},
								target: `${baseUrl}/api/manifest/${story.id}/canvas/1`,
							},
						],
					},
				],
				annotations:
					story.annotations.length > 0
						? [
								{
									id: `${baseUrl}/api/manifest/${story.id}/canvas/1/annotations`,
									type: "AnnotationPage",
									items: story.annotations.map((annotation) => {
										// Build the annotation body
										const textBody = {
											type: "TextualBody",
											value: annotation.text,
											language: "en",
											format: "text/plain",
										};

										// If there are images, body becomes an array
										const imageBodies = annotation.images.map((img) => ({
											type: "Image",
											id: img.imageUrl,
											format: "image/jpeg",
										}));

										const body =
											imageBodies.length > 0
												? [textBody, ...imageBodies]
												: textBody;

										return {
											id: `${baseUrl}/api/manifest/${story.id}/canvas/1/annotations/${annotation.id}`,
											type: "Annotation",
											motivation: "commenting",
											body,
											target: `${baseUrl}/api/manifest/${story.id}/canvas/1#xywh=${Math.round(annotation.x)},${Math.round(annotation.y)},${Math.round(annotation.width)},${Math.round(annotation.height)}`,
										};
									}),
								},
							]
						: undefined,
			},
		],
	};

	return NextResponse.json(manifest, {
		headers: {
			"Content-Type":
				'application/ld+json;profile="http://iiif.io/api/presentation/3/context.json"',
			"Access-Control-Allow-Origin": "*",
		},
	});
}
