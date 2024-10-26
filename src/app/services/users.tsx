'use client';

import Pageable from "../models/Pageable";

// While it does not utilize any paging, should have params for it for the future...
export class GetUsersArgs extends Pageable
{
    constructor(
        page: number,
        pageSize: number | null = null,
        sortField: string | null = null,
        sortOrder: boolean | null = false
    )
    {
        super(page, pageSize, sortField, sortOrder);
    }
}

export async function getUsers(
    args: GetUsersArgs
) 
{
    try {
        return await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/api/Users/GetUsersWithSort?` +
            `${args.sortField != null? `&sortField=${args.sortField}` : ''}` + 
            `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : ''}`,
            {
                redirect: 'error',                
            }).then(res => res.json());
    } catch(_) {
        return {message: "Fetch failed"} 
    }
}