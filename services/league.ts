import api from './api';

export const leagueService = {
  // GET /league/public?page=1&limit=10
  getPublicLeagues: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/league/public?page=${page}&limit=${limit}`);
    return response.data;
  },

  // GET /league/my-leagues
  getMyLeagues: async () => {
    const response = await api.get('/league/my-leagues');
    return response.data;
  },

  // GET /league/:id
  getLeagueById: async (id: string, token?: string) => {
    const url = token ? `/league/${id}?token=${token}` : `/league/${id}`;
    const response = await api.get(url);
    return response.data.league;
  },

  // POST /league/create
  createLeague: async (payload: FormData | object) => {
    console.log('Creating league...');
    
    // Handle both FormData and JSON
    const response = await api.post('/league/create', payload);
    return response.data;
  },

  // PATCH /league/:id
  updateLeague: async (id: string, payload: FormData | object) => {
    const response = await api.patch(`/league/${id}`, payload);
    return response.data;
  },

  // DELETE /league/:id
  deleteLeague: async (id: string) => {
    const response = await api.delete(`/league/${id}`);
    return response.data;
  },

  // PATCH /league/:id/status
  updateLeagueStatus: async (id: string, status: string) => {
    const response = await api.patch(`/league/${id}/status`, { status });
    return response.data;
  },

  // PATCH /league/:id/visibility
  updateVisibility: async (id: string, visibility: 'public' | 'private') => {
    const response = await api.patch(`/league/${id}/visibility`, { visibility });
    return response.data;
  },

  // POST /league/:id/generate-token
  generateToken: async (id: string) => {
    const response = await api.post(`/league/${id}/generate-token`);
    return response.data;
  },
};
