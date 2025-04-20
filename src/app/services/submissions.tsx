export class GetSubmissionsProtocolArgs {
    constructor
    (
        fYear: number | null,
        fMonth: number | null,
        fDay: number | null,
        tYear: number | null,
        tMonth: number | null,
        tDay: number | null,
        contestId: number | null = null,
        page: number | null = 1,
        pageSize: number | null = 100
    )
    {
        this.fYear = fYear;
        this.fMonth = fMonth;
        this.fDay = fDay;
        this.tYear = tYear;
        this.tMonth = tMonth;
        this.tDay = tDay;
        this.contestId = contestId;
        this.page = page;
        this.pageSize = pageSize;
    }

    fYear: number | null;
    fMonth: number | null;
    fDay: number | null;
    tYear: number | null;
    tMonth: number | null;
    tDay: number | null;
    contestId: number | null;
    page: number | null;
    pageSize: number | null;
}

export async function getSubmissionsProtocol(
    args: GetSubmissionsProtocolArgs
) 
{
    // return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Submissions?` +
    return fetch(`http://localhost:8080/api/Submissions?` +
        `page=${args.page}` + 
        `${args.pageSize != null? `&pageSize=${args.pageSize}` : '&pageSize=20'}` + 
        `${args.fYear != null? `&fYear=${args.fYear}` : ''}` + 
        `${args.fMonth != null? `&fMonth=${args.fMonth}` : ''}` + 
        `${args.fDay != null? `&fDay=${args.fDay}` : ''}` + 
        `${args.tYear != null? `&tYear=${args.tYear}` : ''}` + 
        `${args.tMonth != null? `&tMonth=${args.tMonth}` : ''}` + 
        `${args.tDay != null? `&tDay=${args.tDay}` : ''}` + 
        `${args.contestId != null? `&contestId=${args.contestId}` : ''}`,
        {redirect: 'error'});
}