import api from './api';

export const matchService = {
  // POST /match/generate-schedule/:leagueId
  generateSchedule: async (leagueId: string) => {
    const response = await api.post(`/match/generate-schedule/${leagueId}`);
    return response.data;
  },

  // GET /match/league/:leagueId
  getMatchesByLeague: async (leagueId: string, token?: string, filters?: {
    round?: number;
    group?: string;
    status?: string;
  }) => {
    let url = `/match/league/${leagueId}`;
    const params = new URLSearchParams();
    
    if (token) params.append('token', token);
    
    if (filters?.round) params.append('round', filters.round.toString());
    if (filters?.group) params.append('group', filters.group);
    if (filters?.status) params.append('status', filters.status);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // GET /match/:id
  getMatchById: async (id: string) => {
    const response = await api.get(`/match/${id}`);
    return response.data.match;
  },

  // PATCH /match/:id/info
  updateMatchInfo: async (id: string, data: {
    scheduledDate?: string;
    venue?: string;
    referee?: string;
    notes?: string;
  }) => {
    const response = await api.patch(`/match/${id}/info`, data);
    return response.data;
  },

  // PUT /match/:id/result
  updateMatchResult: async (id: string, data: {
    homeScore: number;
    awayScore: number;
  }) => {
    const response = await api.patch(`/match/${id}/result`, data);
    return response.data;
  },

  // PATCH /match/:id/status
  updateMatchStatus: async (id: string, status: string) => {
    const response = await api.patch(`/match/${id}/status`, { status });
    return response.data;
  },

  // PATCH /match/:id/video
  updateMatchVideo: async (id: string, videoUrl: string | null) => {
    const response = await api.patch(`/match/${id}/video`, { videoUrl });
    return response.data;
  },

  // POST /match/:id/highlights
  uploadHighlights: async (id: string, formData: FormData) => {
    const response = await api.post(`/match/${id}/highlights`, formData);
    return response.data;
  },

  // DELETE /match/:id/highlights/:highlightId
  deleteHighlight: async (matchId: string, highlightId: string) => {
    const response = await api.delete(`/match/${matchId}/highlights/${highlightId}`);
    return response.data;
  },

  // PATCH /match/:id/photos
  uploadPhotos: async (id: string, formData: FormData) => {
    const response = await api.patch(`/match/${id}/photos`, formData);
    return response.data;
  },

  // PATCH /match/:id/reset
  resetMatch: async (id: string) => {
    const response = await api.patch(`/match/${id}/reset`);
    return response.data;
  },

  // PATCH /match/reset-all/:leagueId
  resetAllMatches: async (leagueId: string) => {
    const response = await api.patch(`/match/reset-all/${leagueId}`);
    return response.data;
  },

  // DELETE /match/:id
  deleteMatch: async (id: string) => {
    const response = await api.delete(`/match/${id}`);
    return response.data;
  },

  // DELETE /match/delete-schedule/:leagueId
  deleteSchedule: async (leagueId: string) => {
    const response = await api.delete(`/match/delete-schedule/${leagueId}`);
    return response.data;
  },
};
