import createClient from 'openapi-fetch';
import type { paths, components } from '../types/api';

// Create typed API client
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = createClient<paths>({ baseUrl: API_BASE_URL });

// Export commonly used types for convenience
export type Property = components['schemas']['models.AlojamentoResponse'];
export type PaginatedProperties = components['schemas']['models.PaginatedResponse-models_AlojamentoResponse'];
export type PaginationMeta = components['schemas']['models.PaginationMeta'];
export type Stats = components['schemas']['models.StatsResponse'];
export type DistrictStats = components['schemas']['models.DistrictStats'];
export type MunicipalityStats = components['schemas']['models.MunicipalityStats'];
export type TypeStats = components['schemas']['models.TypeStats'];
export type ErrorResponse = components['schemas']['models.ErrorResponse'];

// API functions with full type safety
export const api = {
  // Get paginated list of properties
  async getProperties(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
  }) {
    const { data, error } = await apiClient.GET('/alojamentos', {
      params: { query: params },
    });
    if (error) throw error;
    return data;
  },

  // Search properties with filters
  async searchProperties(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
    concelho?: string;
    distrito?: string;
    modalidade?: string;
    email?: string;
    min_capacity?: number;
    max_capacity?: number;
    min_lat?: number;
    max_lat?: number;
    min_lng?: number;
    max_lng?: number;
  }) {
    const { data, error } = await apiClient.GET('/alojamentos/search', {
      params: { query: params },
    });
    if (error) throw error;
    return data;
  },

  // Get property by ID
  async getPropertyById(id: number) {
    const { data, error } = await apiClient.GET('/alojamentos/{id}', {
      params: { path: { id } },
    });
    if (error) throw error;
    return data;
  },

  // Get statistics
  async getStats() {
    const { data, error } = await apiClient.GET('/alojamentos/stats');
    if (error) throw error;
    return data;
  },
};
