export type ImageField = { id: string; value: string };

export const createImageField = (value = ""): ImageField => ({
  id: crypto.randomUUID(),
  value,
});

export type AudioField = { id: string; value: string };

export const createAudioField = (value = ""): AudioField => ({
  id: crypto.randomUUID(),
  value,
});
