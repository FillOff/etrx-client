'use client';

// While it does not utilize any paging, should have params for it for the future...
export class GetProblemsArgs
{
    constructor(
        public page: number | null = null,
        public pageSize: number | null = null,
        public sortField: string | null = null,
        public sortOrder: boolean | null = true,
        public tags: string[] | null = [],
        public indexes: string[] | null = []
    ) {}
}

export async function getProblems(
    args: GetProblemsArgs
) 
{
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Problems/GetProblemsByPageWithSortAndFilterTags?` +
        `${args.page != null? `&page=${args.page}` : ''}` +
        `${args.pageSize != null? `&pageSize=${args.pageSize}` : ''}` +
        `${args.tags != null? `&tags=${args.tags.join(';')}` : ''}` +
        `${args.indexes != null? `&indexes=${args.indexes.join(';')}` : ''}` +
        `${args.sortField != null? `&sortField=${args.sortField}` : ''}` + 
        `${args.sortOrder != null? `&sortOrder=${args.sortOrder}` : '&sortOrder=false'}`,
        {
            redirect: 'error',                
        });
}

export async function getTags()
{
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Problems/GetTagsList`,
    {
        redirect: 'error',
    });
}

export async function getIndexes()
{
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Problems/GetIndexesList`,
    {
        redirect: 'error',
    });
}