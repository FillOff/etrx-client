'use client';

import Pageable from "../models/Pageable";
import Sortable from "../models/Sortable";

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
    } catch(error: any|unknown) {
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
    try {
        return await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/api/Contests/GetContestsByPageWithSort?` +
            `page=${args.page}` + 
            `${args.pageSize != null? `&pageSize=${args.pageSize}` : '&pageSize=20'}` + 
            `${args.isGym != null? `&gym=${args.isGym}` : ''}` + 
            `${args.sortField != null? `&sortField=${args.sortField}` : ''}` + 
            `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : ''}`,
            {
                redirect: 'error',     
            }).then(res => res.json());
    } catch(error: any|unknown) {
        return {message: "Fetch failed"} 
    }
}