"use client";

import { useId, useMemo, useState, useTransition } from "react";
import { createAnnotation } from "@/lib/actions";
import { createImageField, type ImageField } from "@/lib/form-utils";
import { useStrings } from "@/lib/i18n/LanguageProvider";
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
	const [imageFields, setImageFields] = useState<ImageField[]>([]);
	const strings = useStrings();
	const textAreaId = useId();

	const dataPreview = useMemo(() => {
		try {
			return JSON.stringify(
				{
					rect: pendingData.rect,
					viewport: pendingData.viewport,
					imageUrls: imageFields
						.map((field) => field.value.trim())
						.filter((value) => value),
				},
				null,
				2,
			);
		} catch {
			return null;
		}
	}, [imageFields, pendingData]);

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
				imageUrls: imageFields
					.map((field) => field.value.trim())
					.filter((url) => url !== ""),
			});
			onSave();
		});
	};

	return (
		<div className="mb-4 p-3 border-2 border-cogapp-lavender rounded-md bg-cogapp-lavender/40">
			<label htmlFor={textAreaId} className="block text-sm font-medium mb-2">
				{strings.newAnnotationForm.textLabel}
			</label>
			<textarea
				id={textAreaId}
				value={text}
				onChange={(e) => setText(e.target.value)}
				className="w-full px-2 py-1 border rounded text-sm"
				rows={3}
				placeholder={strings.newAnnotationForm.placeholder}
			/>

			<div className="mt-3">
				<p className="block text-sm font-medium mb-2">
					{strings.newAnnotationForm.imagesLabel}
				</p>
				{imageFields.map((field) => (
					<div key={field.id} className="flex gap-2 mb-2">
						<input
							type="url"
							value={field.value}
							onChange={(e) => {
								setImageFields((current) =>
									current.map((item) =>
										item.id === field.id
											? { ...item, value: e.target.value }
											: item,
									),
								);
							}}
							className="flex-1 px-2 py-1 border rounded text-sm"
							placeholder={strings.newAnnotationForm.imagePlaceholder}
						/>
						<Button
							variant="danger"
							size="sm"
							onClick={() => {
								setImageFields((current) =>
									current.filter((item) => item.id !== field.id),
								);
							}}
						>
							{strings.newAnnotationForm.removeImage}
						</Button>
					</div>
				))}
				<button
					type="button"
					onClick={() =>
						setImageFields((current) => [...current, createImageField()])
					}
					className="text-sm text-cogapp-charcoal hover:text-cogapp-charcoal/70"
				>
					+ {strings.newAnnotationForm.addImage}
				</button>
			</div>

			<div className="flex gap-2 mt-3">
				<Button size="sm" onClick={handleSave} disabled={isPending}>
					{isPending
						? strings.newAnnotationForm.saving
						: strings.newAnnotationForm.save}
				</Button>
				<Button variant="secondary" size="sm" onClick={onCancel}>
					{strings.newAnnotationForm.cancel}
				</Button>
			</div>
			<details className="mt-3 text-xs">
				<summary className="cursor-pointer text-gray-500">
					{strings.common.data}
				</summary>
				{dataPreview ? (
					<pre className="mt-1 p-2 bg-white rounded text-gray-600 overflow-x-auto">
						{dataPreview}
					</pre>
				) : (
					<p className="mt-1 p-2 bg-white rounded text-red-600 text-xs">
						{strings.newAnnotationForm.previewUnavailable}
					</p>
				)}
			</details>
		</div>
	);
};

export default NewAnnotationForm;
