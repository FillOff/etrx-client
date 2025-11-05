export interface Contest {
    contestId: number;
    name: string;
    durationSeconds: number;
    startTime: number;
    relativeTimeSeconds: number;
    isContestLoaded: boolean;
    gym: boolean;
}

export type ContestForTable = Contest & { id: number };