export interface ChangeDetail {
    type: string;
    details: string[];
}

export interface UpdateData {
    date: string;
    items: ChangeDetail[];
}