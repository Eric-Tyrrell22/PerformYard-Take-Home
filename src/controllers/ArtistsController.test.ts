import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArtistsController } from './ArtistsController';
import type { ArtistsRepository } from '@/repositories';
import type { Context } from 'hono';

// Mock Hono context
const createMockContext = (json: { genre: string; artist: string }) => {
  const mockJson = vi.fn((data, status) => ({ data, status }));

  return {
    req: {
      valid: vi.fn((type: string) => {
        if (type === 'json') return json;
        return {};
      }),
    },
    json: mockJson,
  } as unknown as Context;
};

describe('ArtistsController', () => {
  let controller: ArtistsController;
  let mockArtistsRepo: ArtistsRepository;

  beforeEach(() => {
    // Create a mock repository
    mockArtistsRepo = {
      add: vi.fn(),
    } as unknown as ArtistsRepository;

    controller = new ArtistsController(mockArtistsRepo);
  });

  describe('addArtist', () => {
    it('should add artist successfully and return 201', async () => {
      vi.mocked(mockArtistsRepo.add).mockReturnValue(undefined);

      const mockContext = createMockContext({ genre: 'Rock', artist: 'The Beatles' });
      const response = await controller.addArtist(mockContext);

      // Verify repository was called with correct parameters
      expect(mockArtistsRepo.add).toHaveBeenCalledWith('Rock', 'The Beatles');
      expect(mockArtistsRepo.add).toHaveBeenCalledTimes(1);

      // Verify response structure
      expect(response).toEqual({
        data: {
          message: 'Artist added successfully',
          genre: 'Rock',
          artist: 'The Beatles',
        },
        status: 201,
      });
    });

    it('should return 409 when artist already exists', async () => {
      vi.mocked(mockArtistsRepo.add).mockImplementation(() => {
        throw new Error('Artist already exists');
      });

      const mockContext = createMockContext({ genre: 'Rock', artist: 'The Beatles' });
      const response = await controller.addArtist(mockContext);

      expect(mockArtistsRepo.add).toHaveBeenCalledWith('Rock', 'The Beatles');
      expect(response).toEqual({
        data: { error: 'Artist already exists in this genre' },
        status: 409,
      });
    });

    it('should handle adding artist to new genre', async () => {
      vi.mocked(mockArtistsRepo.add).mockReturnValue(undefined);

      const mockContext = createMockContext({ genre: 'Electronic', artist: 'Daft Punk' });
      const response = await controller.addArtist(mockContext);

      expect(mockArtistsRepo.add).toHaveBeenCalledWith('Electronic', 'Daft Punk');
      expect(response).toEqual({
        data: {
          message: 'Artist added successfully',
          genre: 'Electronic',
          artist: 'Daft Punk',
        },
        status: 201,
      });
    });

    it('should handle adding artist to existing genre', async () => {
      vi.mocked(mockArtistsRepo.add).mockReturnValue(undefined);

      const mockContext = createMockContext({ genre: 'Jazz', artist: 'Chet Baker' });
      const response = await controller.addArtist(mockContext);

      expect(mockArtistsRepo.add).toHaveBeenCalledWith('Jazz', 'Chet Baker');
      expect(response).toEqual({
        data: {
          message: 'Artist added successfully',
          genre: 'Jazz',
          artist: 'Chet Baker',
        },
        status: 201,
      });
    });

    it('should handle artist names with special characters', async () => {
      vi.mocked(mockArtistsRepo.add).mockReturnValue(undefined);

      const mockContext = createMockContext({ genre: 'Rock', artist: 'AC/DC' });
      const response = await controller.addArtist(mockContext);

      expect(mockArtistsRepo.add).toHaveBeenCalledWith('Rock', 'AC/DC');
      expect(response).toEqual({
        data: {
          message: 'Artist added successfully',
          genre: 'Rock',
          artist: 'AC/DC',
        },
        status: 201,
      });
    });

    it('should handle genre names with different casing', async () => {
      vi.mocked(mockArtistsRepo.add).mockReturnValue(undefined);

      const mockContext = createMockContext({ genre: 'HIP-HOP', artist: 'Kendrick Lamar' });
      const response = await controller.addArtist(mockContext);

      expect(mockArtistsRepo.add).toHaveBeenCalledWith('HIP-HOP', 'Kendrick Lamar');
      expect(response).toEqual({
        data: {
          message: 'Artist added successfully',
          genre: 'HIP-HOP',
          artist: 'Kendrick Lamar',
        },
        status: 201,
      });
    });

    it('should extract body from request validation', async () => {
      vi.mocked(mockArtistsRepo.add).mockReturnValue(undefined);

      const mockContext = createMockContext({ genre: 'Rock', artist: 'Queen' });

      // Spy on the req.valid method
      const validSpy = vi.spyOn(mockContext.req, 'valid');

      await controller.addArtist(mockContext);

      expect(validSpy).toHaveBeenCalledWith('json');
      expect(validSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle any error from repository as 409 conflict', async () => {
      vi.mocked(mockArtistsRepo.add).mockImplementation(() => {
        throw new Error('Some unexpected error');
      });

      const mockContext = createMockContext({ genre: 'Pop', artist: 'Madonna' });
      const response = await controller.addArtist(mockContext);

      expect(response).toEqual({
        data: { error: 'Artist already exists in this genre' },
        status: 409,
      });
    });

    it('should handle artist with long names', async () => {
      vi.mocked(mockArtistsRepo.add).mockReturnValue(undefined);

      const longArtistName = 'The Very Long Artist Name That Goes On And On';
      const mockContext = createMockContext({ genre: 'Rock', artist: longArtistName });
      const response = await controller.addArtist(mockContext);

      expect(mockArtistsRepo.add).toHaveBeenCalledWith('Rock', longArtistName);
      expect(response.data.artist).toBe(longArtistName);
    });

    it('should handle genres with spaces', async () => {
      vi.mocked(mockArtistsRepo.add).mockReturnValue(undefined);

      const mockContext = createMockContext({ genre: 'Heavy Metal', artist: 'Metallica' });
      const response = await controller.addArtist(mockContext);

      expect(mockArtistsRepo.add).toHaveBeenCalledWith('Heavy Metal', 'Metallica');
      expect(response).toEqual({
        data: {
          message: 'Artist added successfully',
          genre: 'Heavy Metal',
          artist: 'Metallica',
        },
        status: 201,
      });
    });
  });
});
