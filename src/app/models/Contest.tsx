export interface Contest {
    contestId: number;
    name: string;
    startTime: number;
    isContestLoaded: boolean;
}

export type ContestForTable = Contest & { id: number };