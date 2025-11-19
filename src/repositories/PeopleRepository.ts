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

export const sortableFields = ['name', 'score'] as const;
export type PersonSortableFields = (typeof sortableFields)[number];
const secondarySortMap: Record<PersonSortableFields, PersonSortableFields> = {
  'name': 'score',
  'score': 'name'
}

type SortDirs = 'ASC' | 'DESC'

type SearchParams = {
  query: string;
  sort?: PersonSortableFields;
  sortDir?: SortDirs;
}

type SortParams = {
  results: PersonSearchResult[];
  sort: PersonSortableFields;
  sortDir: SortDirs;
}

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

  search({
    query,
    sort = 'score',
    sortDir =  'DESC'
  }: SearchParams): PersonSearchResult[] {
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
    const sortedResults = this.getSortedResults({
      results: filteredResults,
      sort,
      sortDir
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

  private getSortedResults({
    results,
    sort,
    sortDir
  }: SortParams): PersonSearchResult[] {
    function comparator<T extends string | number>(a: T, b: T) {
      if(a === b) {
        return 0;
      }

      return a > b ? 1 : -1;
    }

    const sortedResults = results.toSorted((a,b) => {
      const aVal = a[sort];
      const bVal = b[sort];
      const secondarySortField = secondarySortMap[sort];
      const primaryComparison = comparator(aVal, bVal)

      if(primaryComparison === 0 && secondarySortField) {
        const secondaryAVal = a[secondarySortField];
        const secondaryBVal = b[secondarySortField];
        const secondaryComparison = comparator(secondaryAVal, secondaryBVal);

        return secondaryComparison;
      }

      const direction = sortDir === 'ASC' ? 1 : -1;
      return primaryComparison * direction;
    });

    return sortedResults;
  }


}
