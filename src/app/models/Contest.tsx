export default class Contest
{
    constructor(
        contestId: number,
        name: string,
        startTime: number,
    )
    {
        this.contestId = contestId;
        this.name = name;
        this.startTime = startTime;
    }
    contestId: number;
    name: string;
    startTime: number;
}