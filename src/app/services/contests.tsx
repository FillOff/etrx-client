'use client';

import Pageable from "../models/Pageable";
import Sortable from "../models/Sortable";

// TODO: POST to update backend contests table

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
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Contests?` +
        `page=${args.page}` + 
        `${args.pageSize != null? `&pageSize=${args.pageSize}` : '&pageSize=20'}` + 
        `${args.isGym != null? `&gym=${args.isGym}` : ''}` + 
        `${args.sortField != null? `&sortField=${args.sortField}` : ''}` + 
        `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : '&sortOrder=false'}`,
        {redirect: 'error'});
}

export class GetContestSubmissionsArgs extends Sortable
{
    constructor(
        public contestId: number,
        public sortField: string | null,
        public sortOrder: boolean | null,
        public filterByParticipantType: string | null
    )
    {
        super(sortField, sortOrder);
        this.filterByParticipantType = filterByParticipantType;
    }
}

export async function getContestSubmissions(args: GetContestSubmissionsArgs)
{
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Submissions/${args.contestId}?` +
        `${args.sortField != null? `&sortField=${args.sortField}` : ''}` +
        `${args.filterByParticipantType != null? `&filterByParticipantType=${args.filterByParticipantType}` : ''}` +
        `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : ''}`,
        {
            redirect: 'error',     
        }); 
}

export async function getContestSubmissionsWithUpdate(args: GetContestSubmissionsArgs)
{
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Submissions/${args.contestId}?` +
        `${args.sortField != null? `&sortField=${args.sortField}` : ''}` +
        `${args.filterByParticipantType != null? `&filterByParticipantType=${args.filterByParticipantType}` : ''}` +
        `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : ''}`,
        {
            redirect: 'error',     
        }); 
}

export async function updateContestSubmissions(contestId: number)
{
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Codeforces/Submissions/${contestId}?`,
        {
            redirect: 'error',   
            method: 'POST',  
        }); 
}

export async function getContest(contestId: number)
{
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Contests/${contestId}?`,
        {
            redirect: 'error',   
            method: 'GET',  
        }); 
}