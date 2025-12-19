import api from './api';

export const teamService = {
  // GET /team/league/:leagueId
  getTeamsByLeague: async (leagueId: string, token?: string) => {
    const url = token ? `/team/league/${leagueId}?token=${token}` : `/team/league/${leagueId}`;
    const response = await api.get(url);
    return response.data;
  },

  // GET /team/league/:leagueId?group=A
  getTeamsByGroup: async (leagueId: string, group: string, token?: string) => {
    const url = token 
      ? `/team/league/${leagueId}?group=${group}&token=${token}` 
      : `/team/league/${leagueId}?group=${group}`;
    const response = await api.get(url);
    return response.data;
  },

  // GET /team/:id
  getTeamById: async (id: string, token?: string) => {
    const url = token ? `/team/${id}?token=${token}` : `/team/${id}`;
    const response = await api.get(url);
    return response.data.team;
  },

  // POST /team/create
  createTeam: async (formData: FormData) => {
    const response = await api.post('/team/create', formData);
    return response.data;
  },

  // PUT /team/:id
  updateTeam: async (id: string, formData: FormData) => {
    const response = await api.patch(`/team/${id}`, formData);
    return response.data;
  },

  // DELETE /team/:id
  deleteTeam: async (id: string) => {
    const response = await api.delete(`/team/${id}`);
    return response.data;
  },

  // POST /team/assign-groups/:leagueId
  assignGroups: async (leagueId: string) => {
    const response = await api.post(`/team/assign-groups/${leagueId}`);
    return response.data;
  },

  // POST /team/reset-groups/:leagueId
  resetGroups: async (leagueId: string) => {
    const response = await api.post(`/team/reset-groups/${leagueId}`);
    return response.data;
  },
};
