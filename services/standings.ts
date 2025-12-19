import api from './api';

export const standingsService = {
  // GET /standings/league/:id
  getStandings: async (leagueId: string, token?: string) => {
    const url = token ? `/standings/league/${leagueId}?token=${token}` : `/standings/league/${leagueId}`;
    const response = await api.get(url);
    return response.data;
  },

  // GET /standings/league/:id/group/:group
  getGroupStandings: async (leagueId: string, group: string, token?: string) => {
    const url = token
      ? `/standings/league/${leagueId}/group/${group}?token=${token}`
      : `/standings/league/${leagueId}/group/${group}`;
    const response = await api.get(url);
    return response.data;
  },

  // GET /standings/league/:id/all-groups
  getAllGroupsStandings: async (leagueId: string, token?: string) => {
    const url = token
      ? `/standings/league/${leagueId}/all-groups?token=${token}`
      : `/standings/league/${leagueId}/all-groups`;
    const response = await api.get(url);
    return response.data;
  },

  // GET /standings/league/:id/stats
  getLeagueStats: async (leagueId: string, token?: string) => {
    const url = token
      ? `/standings/league/${leagueId}/stats?token=${token}`
      : `/standings/league/${leagueId}/stats`;
    const response = await api.get(url);
    return response.data;
  },

  // GET /standings/team/:id
  getTeamStats: async (teamId: string) => {
    const response = await api.get(`/standings/team/${teamId}`);
    return response.data;
  },
};
