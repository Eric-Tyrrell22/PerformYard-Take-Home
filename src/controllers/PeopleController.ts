import { createRoute, z, type RouteHandler } from '@hono/zod-openapi';
import type { PeopleRepository } from '@/repositories';
import {
  SearchResponseSchema,
  SearchErrorResponseSchema
} from '@/schemas';

export class PeopleController {
  constructor(private peopleRepo: PeopleRepository) {}

  getRoutes() {
    return [this.searchRoute];
  }

  searchRoute = createRoute({
    method: 'get',
    path: '/people/search',
    summary: 'Search for people',
    description: 'Search for people by name or favorite artist',
    tags: ['People'],
    request: {
      query: z.object({
        q: z.string().min(1, 'Query parameter is required').openapi({
          param: {
            name: 'q',
            in: 'query',
            required: true,
          },
          example: 'rock',
        }),
      }),
    },
    responses: {
      200: {
        description: 'Search results',
        content: {
          'application/json': {
            schema: SearchResponseSchema,
          },
        },
      },
      400: {
        description: 'Bad request - missing query parameter',
        content: {
          'application/json': {
            schema: SearchErrorResponseSchema,
          },
        },
      },
    },
  });

  search: RouteHandler<typeof this.searchRoute> = (c) => {
    const { q: query } = c.req.valid('query');

    const results = this.peopleRepo.search(query);

    return c.json({
      results: results
    }, 200);
  }
}
