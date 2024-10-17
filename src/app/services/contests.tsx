'use client';

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

export class GetContestsJsonArgs extends Sortable
{
    constructor(
        page: number,
        pageSize: number | null = null,
        isGym: boolean | null = null,
        sortPropName: string | null = null,
        sortOrder: boolean = false
    ) 
    {
        super();
        this.page = page;
        this.pageSize = pageSize;
        this.isGym = isGym;
        this.sortFieldName = sortPropName;
        this.sortOrder = sortOrder;
    }

    page: number;
    pageSize: number | null = null;
    isGym: boolean | null = null;
    sortFieldName: string | null = null;
    sortOrder: boolean = false;
}

export async function getContestsJson(
    args: GetContestsJsonArgs
) 
{
    try {
        return await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/api/Contests/GetContestsByPageWithSort?` +
            `page=${args.page}` + 
            `${args.pageSize? `&pageSize=${args.pageSize}` : '&pageSize=20'}` + 
            `${args.isGym? `&gym=${args.isGym}` : ''}` + 
            `${args.sortFieldName? `&sortByProp=${args.sortFieldName}` : ''}` + 
            `&sortOrder=${args.sortOrder}`,
            {
                redirect: 'error',
                // headers: {"Content-Type": "application/json"},
                
            }).then(res => res.json());
    } catch(error: any|unknown) {
        return {message: "Fetch failed"} 
    }
}

export async function getSortableFields()
{
    try {
        // return await fetcher(`https://dl.gsu.by/etr/api/contest?index=${startIndex}&count=${count}`);
        return (await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/api/Contests/GetContestsByPageWithSort?page=1&pageSize=0&gym=false&sortByProp=null&sortOrder=false`,
            {
                redirect: 'error', 
                // headers: {"Content-Type": "application/json"},
                
            }).then(res => res.json())).properties;
    } catch(error: any|unknown) {
        return {message: "Fetch failed"} 
    }
}