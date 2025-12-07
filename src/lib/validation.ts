// Validate URL format (HTTP/HTTPS only)
export const isValidHttpUrl = (url: string): boolean => {
	try {
		const parsed = new URL(url);
		return parsed.protocol === "https:" || parsed.protocol === "http:";
	} catch {
		return false;
	}
};

// File upload limits
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
export const MAX_FILE_SIZE_MB = 25;
