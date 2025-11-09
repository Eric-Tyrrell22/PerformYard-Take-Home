import type { Person } from '@/types';
import { searchStringField, searchArrayField } from '@/utils/searchUtils';
import type { ArtistsRepository } from './ArtistsRepository';

export interface PersonSearchResult {
  name: string;
  score: number;
  matches: string[];
}

const searchConfig: Record<string, number> = {
  name: 4,
  location: 1,
  movies: 1,
  musicGenres: 1,
  artists: 2
} as const;

export class PeopleRepository {
  private people: Person[] = [];
  private artistsRepo: ArtistsRepository;

  constructor(peopleData: Person[], artistsRepo: ArtistsRepository) {
    this.artistsRepo = artistsRepo;
    this.people = peopleData;
  }

  /**
   * Adds a new person to the repository
   * @param person The person to add
   */
  add(person: Person): void {
    this.people.push(person);
  }

  search(query: string): PersonSearchResult[] {
    const results = this.people.map((person) => {
      const result: PersonSearchResult = {
        name: person.name,
        score: 0,
        matches: []
      }

      for (const field of Object.keys(searchConfig)) {
        let isMatch = false;

        if (field === 'artists') {
          isMatch = this.searchArtists(person, query);
        } else if (typeof person[field] === 'string') {
          isMatch = searchStringField(query, person[field] as string);
        } else if (Array.isArray(person[field])) {
          isMatch = searchArrayField(query, person[field] as string[]);
        }

        if (isMatch) {
          result.matches.push(field);
          result.score += searchConfig[field];
        }
      }

      return result;
    })

    const filteredResults = results.filter(result => result.score > 0);
    const sortedResults = filteredResults.sort((a, b) => {
      if (b.score - a.score === 0) {
        if (b.name === a.name) {
          return 0;
        }
        return b.name > a.name ? 1 : -1;
      }

      return b.score - a.score
    });

    return sortedResults;
  }

  private searchArtists(person: Person, query: string): boolean {
    for (const genre of person.musicGenres) {
      if (this.artistsRepo.searchByGenre(genre, query)) {
        return true;
      }
    }
    return false;
  }
}
