import type { Context } from 'hono';
import type { PeopleRepository } from '@/repositories';

export class PeopleController {
  constructor(private peopleRepo: PeopleRepository) {}

  search(c: Context) {
    const query = c.req.query('q');

    if (!query) {
      return c.json({ error: 'Query parameter "q" is required' }, 400);
    }

    const results = this.peopleRepo.search(query);

    return c.json({
      results: results
    });
  }
}
