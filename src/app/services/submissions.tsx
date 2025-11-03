import Sortable from "../models/Sortable";

export class GetSubmissionsProtocolArgs extends Sortable {
    constructor
    (
        sortField: string | null = null,
        sortOrder: boolean | null = true,
        fYear: number | null,
        fMonth: number | null,
        fDay: number | null,
        tYear: number | null,
        tMonth: number | null,
        tDay: number | null,
        contestId: number | null = null,
    )
    {
        super(sortField, sortOrder);
        this.fYear = fYear;
        this.fMonth = fMonth;
        this.fDay = fDay;
        this.tYear = tYear;
        this.tMonth = tMonth;
        this.tDay = tDay;
        this.contestId = contestId;
    }

    fYear: number | null;
    fMonth: number | null;
    fDay: number | null;
    tYear: number | null;
    tMonth: number | null;
    tDay: number | null;
    contestId: number | null;
}

export async function getSubmissionsProtocol(
    args: GetSubmissionsProtocolArgs
) 
{
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Submissions?` +
        `${args.sortField != null? `&sortField=${args.sortField}` : ''}` +
        `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : ''}` +
        `${args.fYear != null? `&fYear=${args.fYear}` : ''}` + 
        `${args.fMonth != null? `&fMonth=${args.fMonth}` : ''}` + 
        `${args.fDay != null? `&fDay=${args.fDay}` : ''}` + 
        `${args.tYear != null? `&tYear=${args.tYear}` : ''}` + 
        `${args.tMonth != null? `&tMonth=${args.tMonth}` : ''}` + 
        `${args.tDay != null? `&tDay=${args.tDay}` : ''}` + 
        `${args.contestId != null? `&contestId=${args.contestId}` : ''}`,
        {redirect: 'error'});
}