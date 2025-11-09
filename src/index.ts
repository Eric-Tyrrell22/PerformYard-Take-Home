import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PeopleRepository, ArtistsRepository } from '@/repositories';
import type { Artists, Person } from '@/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load data
const artistsPath = join(__dirname, '../src/data/artists.json');
const peoplePath = join(__dirname, '../src/data/people.json');

const artistsData: Artists = JSON.parse(readFileSync(artistsPath, 'utf-8'));
const peopleData: Person[] = JSON.parse(readFileSync(peoplePath, 'utf-8'));

// Initialize repositories with loaded data
const artistsRepo = new ArtistsRepository(artistsData);
const peopleRepo = new PeopleRepository(peopleData, artistsRepo);

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/people/search', (c) => {
  const query = c.req.query('q');

  if (!query) {
    return c.json({ error: 'Query parameter "q" is required' }, 400);
  }

  const results = peopleRepo.search(query);

  return c.json({
    results: results
  });
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
