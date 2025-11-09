import type { Context } from 'hono';
import type { ArtistsRepository } from '@/repositories';

export class ArtistsController {
  constructor(private artistsRepo: ArtistsRepository) {}

  async addArtist(c: Context) {
    const body = await c.req.json();
    const { genre, artist } = body;

    if (!genre || !artist) {
      return c.json({ error: 'Both "genre" and "artist" fields are required' }, 400);
    }

    try {
      this.artistsRepo.add(genre, artist);
      return c.json({ message: 'Artist added successfully', genre, artist }, 201);
    } catch (error) {
      return c.json({ error: 'Artist already exists in this genre' }, 409);
    }
  }
}
