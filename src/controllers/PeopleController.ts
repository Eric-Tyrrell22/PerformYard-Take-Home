import type { RouteHandler } from '@hono/zod-openapi';
import type { PeopleRepository } from '@/repositories';
import { searchPeopleRoute } from '@/routes';

export class PeopleController {
  constructor(private peopleRepo: PeopleRepository) {}

  search: RouteHandler<typeof searchPeopleRoute> = (c) => {
    const { q: query } = c.req.valid('query');

    const results = this.peopleRepo.search(query);

    return c.json({
      results: results
    }, 200);
  }
}
