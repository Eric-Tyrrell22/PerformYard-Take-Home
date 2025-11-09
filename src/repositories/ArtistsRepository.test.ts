import { describe, it, expect, beforeEach } from 'vitest';
import { ArtistsRepository } from './ArtistsRepository';
import type { Artists } from '@/types';

describe('ArtistsRepository', () => {
  let artistsRepo: ArtistsRepository;
  let mockArtists: Artists;

  beforeEach(() => {
    mockArtists = {
      Rock: ['The Beatles', 'Led Zeppelin', 'Queen'],
      Jazz: ['Miles Davis', 'John Coltrane'],
      Classical: ['Mozart', 'Beethoven']
    };
    artistsRepo = new ArtistsRepository(mockArtists);
  });

  describe('add', () => {
    it('should add artist to existing genre', () => {
      artistsRepo.add('Rock', 'Pink Floyd');

      expect(mockArtists.Rock).toContain('Pink Floyd');
      expect(mockArtists.Rock.length).toBe(4);
    });

    it('should add artist to new genre', () => {
      artistsRepo.add('Electronic', 'Daft Punk');

      expect(mockArtists.Electronic).toBeDefined();
      expect(mockArtists.Electronic).toContain('Daft Punk');
      expect(mockArtists.Electronic.length).toBe(1);
    });

    it('should throw error when artist already exists in genre', () => {
      expect(() => {
        artistsRepo.add('Rock', 'The Beatles');
      }).toThrow('Artist already exists in this genre');
    });

    it('should allow same artist name in different genres', () => {
      artistsRepo.add('Rock', 'Miles Davis');

      expect(mockArtists.Rock).toContain('Miles Davis');
      expect(mockArtists.Jazz).toContain('Miles Davis');
    });

    it('should handle artist names with special characters', () => {
      artistsRepo.add('Rock', 'AC/DC');

      expect(mockArtists.Rock).toContain('AC/DC');
    });

    it('should handle genre names with different casing', () => {
      artistsRepo.add('HIP-HOP', 'Kendrick Lamar');

      expect(mockArtists['HIP-HOP']).toBeDefined();
      expect(mockArtists['HIP-HOP']).toContain('Kendrick Lamar');
    });

    it('should handle artist with long names', () => {
      const longName = 'The Very Long Artist Name That Goes On And On';
      artistsRepo.add('Rock', longName);

      expect(mockArtists.Rock).toContain(longName);
    });

    it('should handle genres with spaces', () => {
      artistsRepo.add('Heavy Metal', 'Metallica');

      expect(mockArtists['Heavy Metal']).toBeDefined();
      expect(mockArtists['Heavy Metal']).toContain('Metallica');
    });

    it('should add multiple artists to same new genre', () => {
      artistsRepo.add('Country', 'Johnny Cash');
      artistsRepo.add('Country', 'Dolly Parton');
      artistsRepo.add('Country', 'Willie Nelson');

      expect(mockArtists.Country).toHaveLength(3);
      expect(mockArtists.Country).toContain('Johnny Cash');
      expect(mockArtists.Country).toContain('Dolly Parton');
      expect(mockArtists.Country).toContain('Willie Nelson');
    });

    it('should preserve existing artists when adding new ones', () => {
      const originalRockArtists = [...mockArtists.Rock];
      artistsRepo.add('Rock', 'Nirvana');

      originalRockArtists.forEach(artist => {
        expect(mockArtists.Rock).toContain(artist);
      });
      expect(mockArtists.Rock).toContain('Nirvana');
    });

    it('should not modify other genres when adding to one genre', () => {
      const originalJazz = [...mockArtists.Jazz];
      const originalClassical = [...mockArtists.Classical];

      artistsRepo.add('Rock', 'The Rolling Stones');

      expect(mockArtists.Jazz).toEqual(originalJazz);
      expect(mockArtists.Classical).toEqual(originalClassical);
    });

    it('should handle empty string artist name', () => {
      artistsRepo.add('Rock', '');

      expect(mockArtists.Rock).toContain('');
    });

    it('should handle empty string genre name', () => {
      artistsRepo.add('', 'Some Artist');

      expect(mockArtists['']).toBeDefined();
      expect(mockArtists['']).toContain('Some Artist');
    });

    it('should throw error for duplicate empty string artist', () => {
      artistsRepo.add('Rock', '');

      expect(() => {
        artistsRepo.add('Rock', '');
      }).toThrow('Artist already exists in this genre');
    });
  });
});
