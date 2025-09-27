export interface Problem {
  id: number;
  contestId: number;
  index: string;
  name: string;
  points: number;
  rating: number;
  tags: string[];
}

export type ProblemForTable = Problem & { id: number };