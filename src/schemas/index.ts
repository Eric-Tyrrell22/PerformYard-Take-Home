import { z } from 'zod';

export const AddArtistRequestSchema = z.object({
  genre: z.string().min(1, 'Genre is required'),
  artist: z.string().min(1, 'Artist is required'),
});

export const AddArtistResponseSchema = z.object({
  message: z.string(),
  genre: z.string(),
  artist: z.string(),
});

export const ArtistErrorResponseSchema = z.object({
  error: z.string(),
});

export const PersonSearchResultSchema = z.object({
  name: z.string(),
  score: z.number(),
  matches: z.array(z.string()),
});

export const SearchResponseSchema = z.object({
  results: z.array(PersonSearchResultSchema),
});

export const SearchErrorResponseSchema = z.object({
  error: z.string(),
});
