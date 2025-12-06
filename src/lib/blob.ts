import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { del, list, put } from "@vercel/blob";

const CONTENT_TYPES: Record<string, string> = {
	".json": "application/ld+json",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".webp": "image/webp",
};

const getContentType = (filePath: string): string => {
	const ext = extname(filePath).toLowerCase();
	return CONTENT_TYPES[ext] || "application/octet-stream";
};

const getFilesRecursive = async (dir: string): Promise<string[]> => {
	const entries = await readdir(dir, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await getFilesRecursive(fullPath)));
		} else {
			files.push(fullPath);
		}
	}

	return files;
};

export const uploadDirectory = async (
	localDir: string,
	blobPrefix: string,
): Promise<string[]> => {
	const files = await getFilesRecursive(localDir);
	const uploadedUrls: string[] = [];

	for (const filePath of files) {
		const relativePath = filePath.replace(localDir, "");
		const blobPath = `${blobPrefix}${relativePath}`;
		const content = await readFile(filePath);
		const contentType = getContentType(filePath);

		const { url } = await put(blobPath, content, {
			access: "public",
			addRandomSuffix: false,
			contentType,
		});

		uploadedUrls.push(url);
	}

	return uploadedUrls;
};

export const deleteDirectory = async (blobPrefix: string): Promise<void> => {
	const { blobs } = await list({ prefix: blobPrefix });

	for (const blob of blobs) {
		await del(blob.url);
	}
};

export const getBlobBaseUrl = (): string => {
	const token = process.env.BLOB_READ_WRITE_TOKEN;
	if (!token) {
		throw new Error("BLOB_READ_WRITE_TOKEN is not set");
	}
	// Extract store ID from token to construct base URL
	// Token format: vercel_blob_rw_<storeId>_<rest>
	const match = token.match(/^vercel_blob_rw_([a-zA-Z0-9]+)_/);
	if (!match) {
		throw new Error("Invalid BLOB_READ_WRITE_TOKEN format");
	}
	return `https://${match[1]}.public.blob.vercel-storage.com`;
};
