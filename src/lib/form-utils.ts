export type ImageField = { id: string; value: string };

export const createImageField = (value = ""): ImageField => ({
	id: crypto.randomUUID(),
	value,
});
