import { createRoute, z, type RouteHandler } from '@hono/zod-openapi';
import type { ArtistsRepository } from '@/repositories';
import {
  AddArtistRequestSchema,
  AddArtistResponseSchema,
  ArtistErrorResponseSchema
} from '@/schemas';

export class ArtistsController {
  constructor(private artistsRepo: ArtistsRepository) {}

  getRoutes() {
    return [this.addArtistRoute];
  }

  addArtistRoute = createRoute({
    method: 'post',
    path: '/artists',
    summary: 'Add a new artist',
    description: 'Add a new artist to a specific genre',
    tags: ['Artists'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: AddArtistRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Artist added successfully',
        content: {
          'application/json': {
            schema: AddArtistResponseSchema,
          },
        },
      },
      400: {
        description: 'Bad request - missing required fields',
        content: {
          'application/json': {
            schema: ArtistErrorResponseSchema,
          },
        },
      },
      409: {
        description: 'Conflict - artist already exists',
        content: {
          'application/json': {
            schema: ArtistErrorResponseSchema,
          },
        },
      },
    },
  });

  addArtist: RouteHandler<typeof this.addArtistRoute> = async (c) => {
    const { genre, artist } = c.req.valid('json');

    try {
      this.artistsRepo.add(genre, artist);
      return c.json({ message: 'Artist added successfully', genre, artist }, 201);
    } catch (error) {
      return c.json({ error: 'Artist already exists in this genre' }, 409);
    }
  }
}
