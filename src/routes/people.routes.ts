import { createRoute, z } from '@hono/zod-openapi';
import {
  SearchResponseSchema,
  SearchErrorResponseSchema
} from '@/schemas';

import {
  sortableFields
} from '../repositories/PeopleRepository';

export const searchPeopleRoute = createRoute({
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
      sort: z.enum(sortableFields).optional().openapi({
        param: {
          name: 'sort',
          in: 'query',
          required: false,
        },
        description: 'Field to sort results by',
        example: 'name',
      }),
      sortDir: z.enum(['ASC', 'DESC']).optional().openapi({
        param: {
          name: 'sortDir',
          in: 'query',
          required: false,
        },
        description: 'Sort direction (ascending or descending)',
        example: 'ASC',
      })
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
