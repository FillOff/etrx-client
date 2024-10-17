
// To inherit by any class that is used as arguments for
// request of sortable tables
export default class Sortable
{
    constructor(sortPropName: string | null = null, sortOrder: boolean = false)
    {
        this.sortFieldName = sortPropName;
        this.sortOrder = sortOrder;
    }
    sortFieldName: string | null;
    sortOrder: boolean;
}