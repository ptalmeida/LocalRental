import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, apiClient } from './api';

// Mock the openapi-fetch client
vi.mock('openapi-fetch', () => ({
  default: vi.fn(() => ({
    GET: vi.fn(),
  })),
}));

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProperties', () => {
    it('should fetch properties successfully', async () => {
      const mockData = {
        data: [
          { id: 1, denominacao: 'Test Property' },
        ],
        pagination: { total: 1, page: 1, limit: 20, has_more: false },
      };

      apiClient.GET = vi.fn().mockResolvedValue({
        data: mockData,
        error: undefined,
      });

      const result = await api.getProperties({ page: 1, limit: 20 });

      expect(result).toEqual(mockData);
      expect(apiClient.GET).toHaveBeenCalledWith('/alojamentos', {
        params: { query: { page: 1, limit: 20 } },
      });
    });

    it('should throw error on failure', async () => {
      const mockError = { error: 'Failed to fetch' };

      apiClient.GET = vi.fn().mockResolvedValue({
        data: undefined,
        error: mockError,
      });

      await expect(api.getProperties()).rejects.toEqual(mockError);
    });
  });

  describe('searchProperties', () => {
    it('should search properties with filters', async () => {
      const mockData = {
        data: [
          { id: 1, distrito: 'Lisboa' },
        ],
        pagination: { total: 1, page: 1, limit: 20, has_more: false },
      };

      apiClient.GET = vi.fn().mockResolvedValue({
        data: mockData,
        error: undefined,
      });

      const filters = {
        distrito: 'Lisboa',
        min_capacity: 2,
        max_capacity: 6,
      };

      const result = await api.searchProperties(filters);

      expect(result).toEqual(mockData);
      expect(apiClient.GET).toHaveBeenCalledWith('/alojamentos/search', {
        params: { query: filters },
      });
    });
  });

  describe('getPropertyById', () => {
    it('should fetch property by ID', async () => {
      const mockData = { id: 123, denominacao: 'Test Property' };

      apiClient.GET = vi.fn().mockResolvedValue({
        data: mockData,
        error: undefined,
      });

      const result = await api.getPropertyById(123);

      expect(result).toEqual(mockData);
      expect(apiClient.GET).toHaveBeenCalledWith('/alojamentos/{id}', {
        params: { path: { id: 123 } },
      });
    });

    it('should throw error when property not found', async () => {
      const mockError = { error: 'Not found' };

      apiClient.GET = vi.fn().mockResolvedValue({
        data: undefined,
        error: mockError,
      });

      await expect(api.getPropertyById(999)).rejects.toEqual(mockError);
    });
  });

  describe('getStats', () => {
    it('should fetch statistics', async () => {
      const mockData = {
        total_accommodations: 100,
        average_capacity: 4.5,
        by_distrito: [{ distrito: 'Lisboa', count: 50 }],
        by_concelho: [{ concelho: 'Lisboa', count: 30 }],
        by_modalidade: [{ modalidade: 'Apartamento', count: 70 }],
      };

      apiClient.GET = vi.fn().mockResolvedValue({
        data: mockData,
        error: undefined,
      });

      const result = await api.getStats();

      expect(result).toEqual(mockData);
      expect(apiClient.GET).toHaveBeenCalledWith('/alojamentos/stats');
    });
  });
});
