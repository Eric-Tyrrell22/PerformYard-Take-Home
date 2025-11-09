import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PeopleRepository, ArtistsRepository } from '@/repositories';
import { PeopleController, ArtistsController } from '@/controllers';
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

// Initialize controllers
const peopleController = new PeopleController(peopleRepo);
const artistsController = new ArtistsController(artistsRepo);

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/people/search', (c) => peopleController.search(c))

app.post('/artists', (c) => artistsController.addArtist(c))

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
