export interface Tag {
    id: string;
    name: string;
    complexity: number;
}

export interface UpdateTagComplexityDto {
    complexity: number;
}