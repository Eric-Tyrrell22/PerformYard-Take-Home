import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PeopleRepository, ArtistsRepository } from '@/repositories';
import { PeopleController, ArtistsController } from '@/controllers';
import { searchPeopleRoute, addArtistRoute } from '@/routes';
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

const app = new OpenAPIHono()

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'PerformYard API',
    description: 'API for managing artists and searching people',
  },
})

app.get('/ui', swaggerUI({ url: '/doc' }))

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Register OpenAPI routes
app.openapi(searchPeopleRoute, peopleController.search)
app.openapi(addArtistRoute, artistsController.addArtist)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
