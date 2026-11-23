'use client';
import { apiFetch } from './auth';


import { User } from '../models/User';

// While it does not utilize any paging, should have params for it for the future...
export class GetUsersArgs {
  constructor(
    public page: number | null = null,
    public pageSize: number | null = null,
    public sortField: string | null = null,
    public sortOrder: boolean | null = false,
  ) {}
}

export async function getUsers(args: GetUsersArgs) {
  return await apiFetch(
    `/api/Users?` +
      `${args.sortField != null ? `&sortField=${args.sortField}` : ''}` +
      `${args.sortOrder != null ? `&sortOrder=${args.sortOrder}` : '&sortOrder=false'}`,
    { redirect: 'error' },
  );
}

export async function getUser(handle: string) {
  return await apiFetch(`/api/Users/${handle}`, {
    redirect: 'error',
  });
}

export async function createUser(user: User) {
  return await apiFetch(`/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...user, grade: Number(user.grade) }),
    redirect: 'error',
  });
}

export async function deleteUser(handle: string) {
  return await apiFetch(
    `/api/users/${encodeURIComponent(handle)}`,
    {
      method: 'DELETE',
      redirect: 'error',
    },
  );
}
