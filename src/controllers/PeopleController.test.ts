import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PeopleController } from './PeopleController';
import type { PeopleRepository } from '@/repositories';
import type { Context } from 'hono';
import type { searchPeopleRoute } from '@/routes';

// Mock Hono context
const createMockContext = (query: { q: string }) => {
  const mockJson = vi.fn((data, status) => ({ data, status }));

  return {
    req: {
      valid: vi.fn((type: string) => {
        if (type === 'query') return query;
        return {};
      }),
    },
    json: mockJson,
  } as unknown as Context;
};

describe('PeopleController', () => {
  let controller: PeopleController;
  let mockPeopleRepo: PeopleRepository;

  beforeEach(() => {
    // Create a mock repository
    mockPeopleRepo = {
      search: vi.fn(),
    } as unknown as PeopleRepository;

    controller = new PeopleController(mockPeopleRepo);
  });

  describe('search', () => {
    it('should return search results with status 200', () => {
      const mockResults = [
        { name: 'John Smith', score: 4, matches: ['name'] },
        { name: 'Jane Doe', score: 2, matches: ['location'] },
      ];

      vi.mocked(mockPeopleRepo.search).mockReturnValue(mockResults);

      const mockContext = createMockContext({ q: 'John' });
      const response = controller.search(mockContext);

      // Verify repository was called with correct query
      expect(mockPeopleRepo.search).toHaveBeenCalledWith('John');
      expect(mockPeopleRepo.search).toHaveBeenCalledTimes(1);

      // Verify response structure
      expect(response).toEqual({
        data: { results: mockResults },
        status: 200,
      });
    });

    it('should return empty results when no matches found', () => {
      vi.mocked(mockPeopleRepo.search).mockReturnValue([]);

      const mockContext = createMockContext({ q: 'nonexistent' });
      const response = controller.search(mockContext);

      expect(mockPeopleRepo.search).toHaveBeenCalledWith('nonexistent');
      expect(response).toEqual({
        data: { results: [] },
        status: 200,
      });
    });

    it('should handle empty query string', () => {
      const mockResults = [
        { name: 'John Smith', score: 1, matches: ['name'] },
        { name: 'Jane Doe', score: 1, matches: ['name'] },
      ];

      vi.mocked(mockPeopleRepo.search).mockReturnValue(mockResults);

      const mockContext = createMockContext({ q: '' });
      const response = controller.search(mockContext);

      expect(mockPeopleRepo.search).toHaveBeenCalledWith('');
      expect(response).toEqual({
        data: { results: mockResults },
        status: 200,
      });
    });

    it('should pass through complex search queries', () => {
      const mockResults = [
        { name: 'John Smith', score: 5, matches: ['name', 'location'] },
      ];

      vi.mocked(mockPeopleRepo.search).mockReturnValue(mockResults);

      const mockContext = createMockContext({ q: 'New York' });
      const response = controller.search(mockContext);

      expect(mockPeopleRepo.search).toHaveBeenCalledWith('New York');
      expect(response).toEqual({
        data: { results: mockResults },
        status: 200,
      });
    });

    it('should handle case-sensitive queries', () => {
      const mockResults = [
        { name: 'JOHN SMITH', score: 4, matches: ['name'] },
      ];

      vi.mocked(mockPeopleRepo.search).mockReturnValue(mockResults);

      const mockContext = createMockContext({ q: 'JOHN' });
      const response = controller.search(mockContext);

      expect(mockPeopleRepo.search).toHaveBeenCalledWith('JOHN');
      expect(response).toEqual({
        data: { results: mockResults },
        status: 200,
      });
    });

    it('should handle special characters in query', () => {
      const mockResults = [
        { name: 'M*A*S*H Fan', score: 4, matches: ['name'] },
      ];

      vi.mocked(mockPeopleRepo.search).mockReturnValue(mockResults);

      const mockContext = createMockContext({ q: 'M*A*S*H' });
      const response = controller.search(mockContext);

      expect(mockPeopleRepo.search).toHaveBeenCalledWith('M*A*S*H');
      expect(response).toEqual({
        data: { results: mockResults },
        status: 200,
      });
    });

    it('should return results with correct structure', () => {
      const mockResults = [
        {
          name: 'John Smith',
          score: 6,
          matches: ['name', 'artists', 'location']
        },
      ];

      vi.mocked(mockPeopleRepo.search).mockReturnValue(mockResults);

      const mockContext = createMockContext({ q: 'John' });
      const response = controller.search(mockContext);

      expect(response.data.results).toBeDefined();
      expect(Array.isArray(response.data.results)).toBe(true);
      expect(response.data.results[0]).toHaveProperty('name');
      expect(response.data.results[0]).toHaveProperty('score');
      expect(response.data.results[0]).toHaveProperty('matches');
      expect(Array.isArray(response.data.results[0].matches)).toBe(true);
    });

    it('should extract query from request validation', () => {
      vi.mocked(mockPeopleRepo.search).mockReturnValue([]);

      const mockContext = createMockContext({ q: 'test query' });

      // Spy on the req.valid method
      const validSpy = vi.spyOn(mockContext.req, 'valid');

      controller.search(mockContext);

      expect(validSpy).toHaveBeenCalledWith('query');
      expect(validSpy).toHaveBeenCalledTimes(1);
    });
  });
});
