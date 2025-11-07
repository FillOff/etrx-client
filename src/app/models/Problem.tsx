export interface Problem {
  contestId: number;
  index: string;
  name: string;
  points: number;
  rating: number;
  difficulty: number;
  tags: string[];
}

export type ProblemForTable = Problem & { id: string };