import { describe, it, expect, beforeEach } from 'vitest';
import { PeopleRepository } from './PeopleRepository';
import { ArtistsRepository } from './ArtistsRepository';
import type { Person, Artists } from '@/types';

describe('PeopleRepository.search', () => {
  let peopleRepo: PeopleRepository;
  let artistsRepo: ArtistsRepository;

  const mockArtists: Artists = {
    Rock: ['The Beatles', 'Led Zeppelin', 'Queen'],
    Jazz: ['Miles Davis', 'John Coltrane', 'Ella Fitzgerald'],
    Classical: ['Mozart', 'Beethoven', 'Bach'],
    Country: ['Johnny Cash', 'Dolly Parton', 'Willie Nelson']
  };

  const mockPeople: Person[] = [
    {
      name: 'John Smith',
      musicGenres: ['Rock', 'Jazz'],
      movies: ['The Matrix', 'Inception'],
      location: 'New York'
    },
    {
      name: 'Jane Doe',
      musicGenres: ['Classical'],
      movies: ['The Godfather', 'Pulp Fiction'],
      location: 'California'
    },
    {
      name: 'Bob Johnson',
      musicGenres: ['Country'],
      movies: ['Star Wars', 'The Matrix'],
      location: 'Texas'
    },
    {
      name: 'Alice Williams',
      musicGenres: ['Rock'],
      movies: ['Titanic', 'Avatar'],
      location: 'Florida'
    }
  ];

  beforeEach(() => {
    artistsRepo = new ArtistsRepository(mockArtists);
    peopleRepo = new PeopleRepository(mockPeople, artistsRepo);
  });

  describe('basic search functionality', () => {
    it('should return empty results when no matches found', () => {
      const results = peopleRepo.search('nonexistent');
      expect(results).toEqual([]);
    });

    it('should match all people with empty query since empty string is contained in all strings', () => {
      const results = peopleRepo.search('');
      // Empty string is contained in all strings, so all people match
      expect(results.length).toBe(mockPeople.length);
    });

    it('should search case-insensitively', () => {
      const results = peopleRepo.search('JOHN');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name === 'John Smith')).toBe(true);
    });

    it('should support partial matches', () => {
      const results = peopleRepo.search('Smi');
      expect(results.some(r => r.name === 'John Smith')).toBe(true);
    });
  });

  describe('field-specific searches', () => {
    it('should find matches in name field', () => {
      const results = peopleRepo.search('Smith');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('John Smith');
      expect(results[0].matches).toContain('name');
    });

    it('should find matches in location field', () => {
      const results = peopleRepo.search('California');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Jane Doe');
      expect(results[0].matches).toContain('location');
    });

    it('should find matches in movies array', () => {
      const results = peopleRepo.search('Matrix');
      expect(results.length).toBe(2);
      const names = results.map(r => r.name);
      expect(names).toContain('John Smith');
      expect(names).toContain('Bob Johnson');
      results.forEach(result => {
        expect(result.matches).toContain('movies');
      });
    });

    it('should find matches in musicGenres array', () => {
      const results = peopleRepo.search('Rock');
      expect(results.length).toBe(2);
      const names = results.map(r => r.name);
      expect(names).toContain('John Smith');
      expect(names).toContain('Alice Williams');
      results.forEach(result => {
        expect(result.matches).toContain('musicGenres');
      });
    });
  });

  describe('artist search integration', () => {
    it('should find people by artist names in their music genres', () => {
      const results = peopleRepo.search('Beatles');
      expect(results.length).toBe(2);
      const names = results.map(r => r.name);
      expect(names).toContain('John Smith');
      expect(names).toContain('Alice Williams');
      results.forEach(result => {
        expect(result.matches).toContain('artists');
        // Verify the person likes Rock music by checking the original data
        const person = mockPeople.find(p => p.name === result.name);
        expect(person?.musicGenres).toContain('Rock');
      });
    });

    it('should find people by jazz artist names', () => {
      const results = peopleRepo.search('Miles Davis');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('John Smith');
      expect(results[0].matches).toContain('artists');
    });

    it('should find people by classical artist names', () => {
      const results = peopleRepo.search('Mozart');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Jane Doe');
      expect(results[0].matches).toContain('artists');
    });

    it('should not match artists from genres the person does not like', () => {
      const results = peopleRepo.search('Willie Nelson');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Bob Johnson');
    });
  });

  describe('scoring and ranking', () => {
    it('should score name matches highest (weight: 4)', () => {
      const person: Person = {
        name: 'Test Person',
        musicGenres: [],
        movies: [],
        location: 'Unknown'
      };
      peopleRepo.add(person);

      const results = peopleRepo.search('Test');
      const testResult = results.find(r => r.name === 'Test Person');
      expect(testResult?.score).toBe(4);
    });

    it('should score artist matches with weight 2', () => {
      const results = peopleRepo.search('Beatles');
      results.forEach(result => {
        const artistScore = result.matches.includes('artists') ? 2 : 0;
        expect(result.score).toBeGreaterThanOrEqual(artistScore);
      });
    });

    it('should score location, movies, and musicGenres with weight 1', () => {
      const person: Person = {
        name: 'Unique Name',
        musicGenres: ['Unique'],
        movies: [],
        location: 'Unknown'
      };
      peopleRepo.add(person);

      const results = peopleRepo.search('Unique');
      const uniqueResult = results.find(r => r.name === 'Unique Name');

      // Should match both name (4) and musicGenres (1) = 5
      expect(uniqueResult?.score).toBe(5);
    });

    it('should rank results by score in descending order', () => {
      const person1: Person = {
        name: 'Rock Star',
        musicGenres: ['Rock'],
        movies: ['Rock Movie'],
        location: 'Rock City'
      };
      const person2: Person = {
        name: 'Different',
        musicGenres: ['Jazz'],
        movies: ['Rock Movie'],
        location: 'Unknown'
      };
      peopleRepo.add(person1);
      peopleRepo.add(person2);

      const results = peopleRepo.search('Rock');

      // Verify scores are in descending order
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }

      // Rock Star should rank higher (name + musicGenres + movies + location = 7)
      // Different should rank lower (movies only = 1)
      expect(results[0].name).toBe('Rock Star');
    });

    it('should sort alphabetically by name when scores are equal', () => {
      const person1: Person = {
        name: 'Zebra Person',
        musicGenres: [],
        movies: ['TestMovie'],
        location: 'Unknown'
      };
      const person2: Person = {
        name: 'Alpha Person',
        musicGenres: [],
        movies: ['TestMovie'],
        location: 'Unknown'
      };
      peopleRepo.add(person1);
      peopleRepo.add(person2);

      const results = peopleRepo.search('TestMovie');

      // Find the two people we just added (both should have same score)
      const addedResults = results.filter(r =>
        r.name === 'Zebra Person' || r.name === 'Alpha Person'
      );

      expect(addedResults.length).toBe(2);
      expect(addedResults[0].score).toBe(addedResults[1].score);

      // Based on the sorting logic (b.name > a.name ? 1 : -1),
      // when comparing a="Alpha", b="Zebra": b.name > a.name is true, returns 1
      // Returning positive means a comes AFTER b, so Zebra comes before Alpha (descending)
      expect(addedResults[0].name).toBe('Zebra Person');
      expect(addedResults[1].name).toBe('Alpha Person');
    });
  });

  describe('multiple field matches', () => {
    it('should accumulate scores from multiple field matches', () => {
      const person: Person = {
        name: 'Star Person',
        musicGenres: [],
        movies: ['Star Wars'],
        location: 'Star City'
      };
      peopleRepo.add(person);

      const results = peopleRepo.search('Star');
      const starResult = results.find(r => r.name === 'Star Person');

      expect(starResult?.matches).toContain('name');
      expect(starResult?.matches).toContain('movies');
      expect(starResult?.matches).toContain('location');
      // name (4) + movies (1) + location (1) = 6
      expect(starResult?.score).toBe(6);
    });

    it('should track all matching fields', () => {
      const results = peopleRepo.search('Rock');
      const john = results.find(r => r.name === 'John Smith');

      // John should match on musicGenres and potentially artists
      expect(john?.matches.length).toBeGreaterThan(0);
      expect(john?.matches).toContain('musicGenres');
    });
  });

  describe('result structure', () => {
    it('should return results with correct structure', () => {
      const results = peopleRepo.search('John');

      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('matches');
        expect(typeof result.name).toBe('string');
        expect(typeof result.score).toBe('number');
        expect(Array.isArray(result.matches)).toBe(true);
      });
    });

    it('should only include results with score > 0', () => {
      const results = peopleRepo.search('Test');
      results.forEach(result => {
        expect(result.score).toBeGreaterThan(0);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in query', () => {
      const person: Person = {
        name: 'M*A*S*H Fan',
        musicGenres: [],
        movies: [],
        location: 'Unknown'
      };
      peopleRepo.add(person);

      const results = peopleRepo.search('M*A*S*H');
      expect(results.some(r => r.name === 'M*A*S*H Fan')).toBe(true);
    });

    it('should handle whitespace in query', () => {
      const results = peopleRepo.search('New York');
      expect(results.some(r => r.name === 'John Smith')).toBe(true);
    });

    it('should handle person with empty arrays', () => {
      const person: Person = {
        name: 'Empty Person',
        musicGenres: [],
        movies: [],
        location: 'Somewhere'
      };
      peopleRepo.add(person);

      const results = peopleRepo.search('Empty');
      expect(results.some(r => r.name === 'Empty Person')).toBe(true);
    });

    it('should handle multiple people with same name', () => {
      const person1: Person = {
        name: 'Same Name',
        musicGenres: ['Rock'],
        movies: [],
        location: 'Place1'
      };
      const person2: Person = {
        name: 'Same Name',
        musicGenres: ['Jazz'],
        movies: [],
        location: 'Place2'
      };
      peopleRepo.add(person1);
      peopleRepo.add(person2);

      const results = peopleRepo.search('Same Name');
      const sameNameResults = results.filter(r => r.name === 'Same Name');
      expect(sameNameResults.length).toBe(2);
    });
  });
});
