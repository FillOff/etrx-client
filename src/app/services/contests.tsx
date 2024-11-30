'use client';

import Pageable from "../models/Pageable";

// TODO: POST to update backend contests table

export async function getContestsPageCount (
    recordsPerPage: number
)
{
    let num: number | null = null;
    try {
        await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/api/Contests/GetCountOfPagesContests?pageCount=${recordsPerPage}`,
            {
                redirect: 'error',                
            }).then(res => res.text()).then(res => num = Number(res));
        return num;
    } catch(_) {
        return num;
    }
}

export class GetContestsArgs extends Pageable
{
    constructor(
        page: number,
        pageSize: number | null = null,
        sortField: string | null = null,
        sortOrder: boolean | null = false,
        isGym: boolean | null = null,
    ) 
    {
        super(page, pageSize, sortField, sortOrder);
        this.isGym = isGym;
    }

    isGym: boolean | null;
}

export async function getContests(
    args: GetContestsArgs
) 
{
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Contests/GetContestsByPageWithSort?` +
        `page=${args.page}` + 
        `${args.pageSize != null? `&pageSize=${args.pageSize}` : '&pageSize=20'}` + 
        `${args.isGym != null? `&gym=${args.isGym}` : ''}` + 
        `${args.sortField != null? `&sortField=${args.sortField}` : ''}` + 
        `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : '&sortOrder=false'}`,
        {redirect: 'error'});
}

export async function getContestSubmissions(contestId: number)
{
    try {
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Submissions/GetSubmissionsByContestIdWithSort?` +
            `contestId=${contestId}`,
            {
                redirect: 'error',     
            }).then(res => res.json());
    } catch(_) {
        return {message: "Fetch failed"} 
    }
}