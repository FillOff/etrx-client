export default class ContestData
{
    constructor(
        contestId: number,
        name: string,
        durationSeconds: number,
        startTime: number,
        relativeTimeSeconds: number,
    )
    {
        this.contestId = contestId;
        this.name = name;
        this.durationSeconds = durationSeconds;
        this.startTime = startTime;
        this.relativeTimeSeconds = relativeTimeSeconds;
    }
    contestId: number;
    name: string;
    durationSeconds: number;
    startTime: number;
    relativeTimeSeconds: number;
}