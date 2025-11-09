import { createRoute } from '@hono/zod-openapi';
import {
  AddArtistRequestSchema,
  AddArtistResponseSchema,
  ArtistErrorResponseSchema
} from '@/schemas';

export const addArtistRoute = createRoute({
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
