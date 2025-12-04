"use client";

import { useState, useTransition } from "react";
import { createAnnotation } from "@/lib/actions";
import { Button } from "./ui";

interface PendingData {
	rect: { x: number; y: number; width: number; height: number };
	viewport: { x: number; y: number; width: number; height: number };
}

interface NewAnnotationFormProps {
	storyId: string;
	pendingData: PendingData;
	onSave: () => void;
	onCancel: () => void;
}

const NewAnnotationForm = ({
	storyId,
	pendingData,
	onSave,
	onCancel,
}: NewAnnotationFormProps) => {
	const [isPending, startTransition] = useTransition();
	const [text, setText] = useState("");
	const [imageUrls, setImageUrls] = useState<string[]>([]);

	const handleSave = () => {
		startTransition(async () => {
			await createAnnotation(storyId, {
				text,
				x: pendingData.rect.x,
				y: pendingData.rect.y,
				width: pendingData.rect.width,
				height: pendingData.rect.height,
				viewportX: pendingData.viewport.x,
				viewportY: pendingData.viewport.y,
				viewportWidth: pendingData.viewport.width,
				viewportHeight: pendingData.viewport.height,
				imageUrls: imageUrls.filter((url) => url.trim() !== ""),
			});
			onSave();
		});
	};

	return (
		<div className="mb-4 p-3 border-2 border-cogapp-blue rounded-md bg-cogapp-light-blue">
			<label className="block text-sm font-medium mb-2">Annotation text</label>
			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				className="w-full px-2 py-1 border rounded text-sm"
				rows={3}
				placeholder="Enter annotation text..."
				autoFocus
			/>

			<div className="mt-3">
				<label className="block text-sm font-medium mb-2">
					Images (optional)
				</label>
				{imageUrls.map((url, index) => (
					<div key={index} className="flex gap-2 mb-2">
						<input
							type="url"
							value={url}
							onChange={(e) => {
								const newUrls = [...imageUrls];
								newUrls[index] = e.target.value;
								setImageUrls(newUrls);
							}}
							className="flex-1 px-2 py-1 border rounded text-sm"
							placeholder="https://example.com/image.jpg"
						/>
						<Button
							variant="danger"
							size="sm"
							onClick={() => {
								setImageUrls(imageUrls.filter((_, i) => i !== index));
							}}
						>
							Remove
						</Button>
					</div>
				))}
				<button
					type="button"
					onClick={() => setImageUrls([...imageUrls, ""])}
					className="text-sm text-blue-600 hover:text-blue-800"
				>
					+ Add image URL
				</button>
			</div>

			<div className="flex gap-2 mt-3">
				<Button size="sm" onClick={handleSave} disabled={isPending}>
					{isPending ? "Saving..." : "Save"}
				</Button>
				<Button variant="secondary" size="sm" onClick={onCancel}>
					Cancel
				</Button>
			</div>
			<details className="mt-3 text-xs">
				<summary className="cursor-pointer text-gray-500">Data</summary>
				<pre className="mt-1 p-2 bg-white rounded text-gray-600 overflow-x-auto">
					{JSON.stringify(
						{
							rect: pendingData.rect,
							viewport: pendingData.viewport,
							imageUrls: imageUrls.filter((u) => u.trim()),
						},
						null,
						2,
					)}
				</pre>
			</details>
		</div>
	);
};

export default NewAnnotationForm;
