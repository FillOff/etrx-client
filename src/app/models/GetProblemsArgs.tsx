import Pageable from "../models/Pageable";

// While it does not utilize any paging, should have params for it for the future...
export class GetProblemsArgs extends Pageable
{
    constructor(
        page: number,
        pageSize: number | null = null,
        sortField: string | null = null,
        sortOrder: boolean | null = true,
        tags: string[] | null = [],
        indexes: string[] | null = [],
        problemName: string,
        minRating: number,
        maxRating: number | undefined,
        minPoints: number,
        maxPoints: number | undefined,
        lang: string | null
    ) 
    {
        super(page, pageSize, sortField, sortOrder);
        this.tags = tags;
        this.indexes = indexes;
        this.problemName = problemName;
        this.minRating = minRating;
        this.maxRating = maxRating;
        this.minPoints = minPoints;
        this.maxPoints = maxPoints;
        this.lang = lang;
    }

    tags: string[] | null;
    indexes: string[] | null;
    problemName: string;
    minRating: number;
    maxRating: number | undefined;
    minPoints: number;
    maxPoints: number | undefined;
    lang: string | null;
}