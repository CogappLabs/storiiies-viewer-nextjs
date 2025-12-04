"use client";

import { useState } from "react";
import { createStory } from "@/lib/actions";

interface IIIFInfo {
	"@id"?: string;
	id?: string;
	width: number;
	height: number;
}

const CreateStoryForm = () => {
	const [infoUrl, setInfoUrl] = useState("");
	const [title, setTitle] = useState("");
	const [author, setAuthor] = useState("");
	const [description, setDescription] = useState("");
	const [attribution, setAttribution] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [iiifInfo, setIiifInfo] = useState<IIIFInfo | null>(null);

	const validateIIIF = async () => {
		setLoading(true);
		setError(null);
		setIiifInfo(null);

		try {
			// Normalize the URL to ensure it ends with info.json
			let url = infoUrl.trim();
			if (!url.endsWith("info.json")) {
				url = `${url.replace(/\/$/, "")}/info.json`;
			}

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(
					`Failed to fetch: ${response.status} ${response.statusText}`,
				);
			}

			const info: IIIFInfo = await response.json();

			if (!info.width || !info.height) {
				throw new Error("Invalid IIIF info.json: missing width or height");
			}

			setIiifInfo(info);
			setInfoUrl(url);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to validate IIIF URL",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!iiifInfo) {
			setError("Please validate the IIIF URL first");
			return;
		}

		if (!title.trim()) {
			setError("Title is required");
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
					IIIF Image URL
				</label>
				<div className="flex gap-2">
					<input
						type="url"
						id="infoUrl"
						value={infoUrl}
						onChange={(e) => {
							setInfoUrl(e.target.value);
							setIiifInfo(null);
						}}
						placeholder="https://example.com/iiif/image/info.json"
						className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
					<button
						type="button"
						onClick={validateIIIF}
						disabled={loading || !infoUrl}
						className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
					>
						{loading ? "Checking..." : "Validate"}
					</button>
				</div>
				{iiifInfo && (
					<p className="mt-2 text-sm text-green-600">
						Valid IIIF image: {iiifInfo.width} × {iiifInfo.height} pixels
					</p>
				)}
			</div>

			{error && (
				<div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
					{error}
				</div>
			)}

			{iiifInfo && (
				<>
					<div>
						<label htmlFor="title" className="block text-sm font-medium mb-2">
							Title *
						</label>
						<input
							type="text"
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>

					<div>
						<label htmlFor="author" className="block text-sm font-medium mb-2">
							Author
						</label>
						<input
							type="text"
							id="author"
							value={author}
							onChange={(e) => setAuthor(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium mb-2"
						>
							Description
						</label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label
							htmlFor="attribution"
							className="block text-sm font-medium mb-2"
						>
							Image Attribution
						</label>
						<input
							type="text"
							id="attribution"
							value={attribution}
							onChange={(e) => setAttribution(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<button
						type="submit"
						className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
					>
						Create Story
					</button>
				</>
			)}
		</form>
	);
};

export default CreateStoryForm;
