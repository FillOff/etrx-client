export interface User {
  handle: string;
  firstName: string;
  lastName: string;
  organization: string;
  city: string;
  grade: string;
}

export type UserForTable = User & { id: string };
