export interface User {
  id: number;
  handle: string;
  firstName: string;
  lastName: string;
  organization: string;
  city: string;
  grade: string;
}

export type UserForTable = User & { id: number };
