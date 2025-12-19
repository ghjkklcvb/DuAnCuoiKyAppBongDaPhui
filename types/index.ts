export interface User {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  avatar: string | null;
  createdLeagues: string[];
  createdAt: string;
}

export interface League {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  owner: User | string;
  type: 'round-robin' | 'group-stage';
  visibility: 'public' | 'private';
  accessToken?: string;
  tournamentStatus: 'upcoming' | 'ongoing' | 'completed';
  numberOfTeams: number;
  teams: Team[] | string[];
  groupSettings?: {
    numberOfGroups: number;
    teamsPerGroup: number;
  };
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface Team {
  _id: string;
  name: string;
  shortName: string;
  logo?: string;
  league: League | string;
  group?: string;
  stats?: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  };
  form?: ('W' | 'D' | 'L')[];
  createdAt: string;
}

export interface Match {
  _id: string;
  league: League | string;
  homeTeam: Team;
  awayTeam: Team;
  round: number;
  matchNumber: number;
  group?: string;
  score: {
    home: number;
    away: number;
  };
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  scheduledDate?: string;
  playedDate?: string;
  venue?: string;
  referee?: string;
  videoUrl?: string;
  highlightVideos: {
    _id: string;
    url: string;
    title?: string;
    uploadedAt: string;
  }[];
  photos: string[];
  notes?: string;
}

export interface Standings {
  position: number;
  team: Team;
  stats?: Team['stats'];
  form?: ('W' | 'D' | 'L')[];
}
