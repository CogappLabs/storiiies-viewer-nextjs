"use client";

import Image from "next/image";
import { useState } from "react";
import { createStory } from "@/lib/actions";
import { useStrings } from "@/lib/i18n/LanguageProvider";
import { Button } from "./ui";

interface IIIFInfo {
	"@id"?: string;
	id?: string;
	width: number;
	height: number;
}

type ManifestCanvasOption = {
	id: string;
	label: string;
	width: number;
	height: number;
	infoUrl: string;
	thumbnail?: string;
};

const normalizeInfoUrl = (url: string): string => {
	if (!url) return "";
	return url.endsWith("info.json")
		? url
		: `${url.replace(/\/$/, "")}/info.json`;
};

const toArray = <T,>(value: T | T[] | undefined | null): T[] => {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
};

const getLabel = (label: unknown, fallback: string): string => {
	if (!label) return fallback;
	if (typeof label === "string") return label;
	if (
		typeof label === "object" &&
		label !== null &&
		"en" in label &&
		Array.isArray((label as { en: string[] }).en) &&
		(label as { en: string[] }).en.length > 0
	) {
		return (label as { en: string[] }).en[0];
	}
	return fallback;
};

const isInfoResponse = (data: unknown): data is IIIFInfo =>
	typeof data === "object" &&
	data !== null &&
	typeof (data as { width?: unknown }).width === "number" &&
	typeof (data as { height?: unknown }).height === "number";

const extractManifestOptions = (manifest: unknown): ManifestCanvasOption[] => {
	if (
		!manifest ||
		typeof manifest !== "object" ||
		!Array.isArray((manifest as { items?: unknown[] }).items)
	) {
		return [];
	}

	const canvases = toArray((manifest as { items?: unknown[] }).items);
	const options: ManifestCanvasOption[] = [];

	canvases.forEach((canvasRaw, index) => {
		if (!canvasRaw || typeof canvasRaw !== "object") return;
		const canvas = canvasRaw as {
			id?: string;
			label?: unknown;
			width?: number;
			height?: number;
			items?: unknown[];
			thumbnail?: Array<{ id?: string }>;
		};

		const annotationPage = toArray(canvas.items)[0] as
			| { items?: unknown[] }
			| undefined;
		const annotation =
			annotationPage &&
			toArray(annotationPage?.items).find(
				(item) => item && typeof item === "object",
			);
		const bodies =
			annotation && typeof annotation === "object"
				? toArray((annotation as { body?: unknown }).body)
				: [];
		const imageBody = bodies.find(
			(body) =>
				body &&
				typeof body === "object" &&
				(body as { type?: string }).type === "Image",
		) as { service?: unknown; id?: string } | undefined;

		const service = imageBody
			? toArray<{ id?: string }>(
					imageBody.service as { id?: string } | { id?: string }[] | undefined,
				)[0]
			: undefined;

		const serviceId =
			(typeof service?.id === "string" && service.id) ||
			(typeof imageBody?.id === "string"
				? imageBody.id.replace(/\/full\/.*$/, "")
				: undefined);

		const width = canvas.width;
		const height = canvas.height;
		if (!width || !height || !serviceId) return;

		options.push({
			id: canvas.id ?? `canvas-${index}`,
			label: getLabel(canvas.label, `Canvas ${index + 1}`),
			width,
			height,
			infoUrl: normalizeInfoUrl(serviceId),
			thumbnail: canvas.thumbnail?.[0]?.id,
		});
	});

	return options;
};

const CreateStoryForm = () => {
	const [infoUrl, setInfoUrl] = useState("");
	const [title, setTitle] = useState("");
	const [author, setAuthor] = useState("");
	const [description, setDescription] = useState("");
	const [attribution, setAttribution] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [iiifInfo, setIiifInfo] = useState<IIIFInfo | null>(null);
	const [manifestOptions, setManifestOptions] = useState<
		ManifestCanvasOption[]
	>([]);
	const [selectedManifestId, setSelectedManifestId] = useState<string | null>(
		null,
	);
	const strings = useStrings();

	const validateIIIF = async () => {
		setLoading(true);
		setError(null);
		setIiifInfo(null);
		setManifestOptions([]);
		setSelectedManifestId(null);

		const trimmedInput = infoUrl.trim();
		if (!trimmedInput) {
			setLoading(false);
			return;
		}

		const fetchJson = async (url: string) => {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(
					strings.createStoryForm.fetchFailed(
						response.status,
						response.statusText,
					),
				);
			}
			return response.json();
		};

		try {
			let requestUrl = trimmedInput;
			let payload: unknown;

			try {
				payload = await fetchJson(requestUrl);
			} catch (initialError) {
				const fallback = normalizeInfoUrl(trimmedInput);
				if (fallback !== requestUrl) {
					requestUrl = fallback;
					payload = await fetchJson(requestUrl);
				} else {
					throw initialError;
				}
			}

			if (isInfoResponse(payload)) {
				if (!payload.width || !payload.height) {
					throw new Error(strings.createStoryForm.invalidInfoResponse);
				}
				setIiifInfo(payload);
				setInfoUrl(normalizeInfoUrl(requestUrl));
				return;
			}

			const options = extractManifestOptions(payload);
			if (options.length === 0) {
				throw new Error(strings.createStoryForm.invalidManifest);
			}
			setManifestOptions(options);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: strings.createStoryForm.errorValidate,
			);
		} finally {
			setLoading(false);
		}
	};

	const handleManifestSelect = (optionId: string) => {
		const option = manifestOptions.find(
			(candidate) => candidate.id === optionId,
		);
		if (!option) return;
		setSelectedManifestId(optionId);
		setIiifInfo({ width: option.width, height: option.height });
		setInfoUrl(option.infoUrl);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!iiifInfo) {
			setError(strings.createStoryForm.mustValidate);
			return;
		}

		if (!title.trim()) {
			setError(strings.createStoryForm.titleRequired);
			return;
		}

		const formData = new FormData();
		formData.set("title", title.trim());
		formData.set("author", author.trim());
		formData.set("description", description.trim());
		formData.set("attribution", attribution.trim());
		formData.set("imageUrl", infoUrl.replace("/info.json", ""));
		formData.set("imageWidth", iiifInfo.width.toString());
		formData.set("imageHeight", iiifInfo.height.toString());

		await createStory(formData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
			<div>
				<label htmlFor="infoUrl" className="block text-sm font-medium mb-2">
					{strings.createStoryForm.infoLabel}
				</label>
				<div className="flex gap-2">
					<input
						type="url"
						id="infoUrl"
						value={infoUrl}
						onChange={(e) => {
							setInfoUrl(e.target.value);
							setIiifInfo(null);
							setManifestOptions([]);
							setSelectedManifestId(null);
						}}
						placeholder={strings.createStoryForm.infoPlaceholder}
						className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cogapp-lavender"
						required
					/>
					<Button
						type="button"
						variant="secondary"
						showArrow={false}
						onClick={validateIIIF}
						disabled={loading || !infoUrl}
					>
						{loading
							? strings.createStoryForm.validating
							: strings.createStoryForm.validate}
					</Button>
				</div>
				<p className="text-xs text-gray-500 mt-1">
					{strings.createStoryForm.infoHint}
				</p>
				{iiifInfo && (
					<p className="mt-2 text-sm text-green-600">
						{strings.createStoryForm.validIIIF(iiifInfo.width, iiifInfo.height)}
					</p>
				)}
			</div>

			{error && (
				<div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
					{error}
				</div>
			)}

			{manifestOptions.length > 0 && (
				<div className="border rounded-md bg-white p-4 space-y-3">
					<div>
						<p className="text-sm font-medium text-gray-700">
							{strings.createStoryForm.manifestDetected(manifestOptions.length)}
						</p>
						<p className="text-xs text-gray-500 mt-1">
							{strings.createStoryForm.manifestInstructions}
						</p>
					</div>
					<div className="space-y-2">
						{manifestOptions.map((option) => (
							<label
								key={option.id}
								className={`flex items-center gap-3 rounded-md border p-2 cursor-pointer ${
									selectedManifestId === option.id
										? "border-cogapp-lavender bg-cogapp-lavender"
										: "border-gray-200 bg-white hover:border-cogapp-gray"
								}`}
							>
								<input
									type="radio"
									name="manifest-canvas"
									value={option.id}
									checked={selectedManifestId === option.id}
									onChange={() => handleManifestSelect(option.id)}
									className="h-4 w-4"
								/>
								<div className="flex-1">
									<div className="font-medium">
										{option.label || strings.createStoryForm.untitledCanvas}
									</div>
									<div className="text-xs text-gray-500">
										{strings.createStoryForm.canvasSize(
											option.width,
											option.height,
										)}
									</div>
								</div>
								{option.thumbnail && (
									<div className="w-14 h-14 flex-shrink-0">
										<Image
											src={option.thumbnail}
											alt={strings.createStoryForm.thumbnailAlt(option.label)}
											width={56}
											height={56}
											unoptimized
											className="w-full h-full object-cover rounded border"
										/>
									</div>
								)}
							</label>
						))}
					</div>
				</div>
			)}

			{iiifInfo && (
				<>
					<div>
						<label htmlFor="title" className="block text-sm font-medium mb-2">
							{strings.createStoryForm.titleLabel}
						</label>
						<input
							type="text"
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cogapp-lavender"
							placeholder={strings.createStoryForm.titlePlaceholder}
							required
						/>
					</div>

					<div>
						<label htmlFor="author" className="block text-sm font-medium mb-2">
							{strings.createStoryForm.authorLabel}
						</label>
						<input
							type="text"
							id="author"
							value={author}
							onChange={(e) => setAuthor(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cogapp-lavender"
						/>
					</div>

					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium mb-2"
						>
							{strings.createStoryForm.descriptionLabel}
						</label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cogapp-lavender"
						/>
					</div>

					<div>
						<label
							htmlFor="attribution"
							className="block text-sm font-medium mb-2"
						>
							{strings.createStoryForm.attributionLabel}
						</label>
						<input
							type="text"
							id="attribution"
							value={attribution}
							onChange={(e) => setAttribution(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cogapp-lavender"
						/>
					</div>

					<Button
						type="submit"
						className="w-full justify-center"
						showArrow={false}
					>
						{strings.createStoryForm.submit}
					</Button>
				</>
			)}
		</form>
	);
};

export default CreateStoryForm;
