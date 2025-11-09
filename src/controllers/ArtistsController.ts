import type { RouteHandler } from '@hono/zod-openapi';
import type { ArtistsRepository } from '@/repositories';
import { addArtistRoute } from '@/routes';

export class ArtistsController {
  constructor(private artistsRepo: ArtistsRepository) {}

  addArtist: RouteHandler<typeof addArtistRoute> = async (c) => {
    const { genre, artist } = c.req.valid('json');

    try {
      this.artistsRepo.add(genre, artist);
      return c.json({ message: 'Artist added successfully', genre, artist }, 201);
    } catch (error) {
      return c.json({ error: 'Artist already exists in this genre' }, 409);
    }
  }
}
