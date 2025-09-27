'use client'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { ReadonlyURLSearchParams } from 'next/navigation';

export function setQueryParams(newParams: Record<string, any>, router : AppRouterInstance) {
    const params = new URLSearchParams(window.location.search);

    Object.entries(newParams).forEach(([key, value]) => {
        params.delete(key);

        if (value !== null && value !== "") {
            params.set(key, String(value));
        }
    });

    router.push(`?${params.toString()}`);
}

export function getQueryParam<T>(query: string, defaultValue: T, searchParams : ReadonlyURLSearchParams, transform?: (value: string) => T): T {
    const value = searchParams.get(query);

    if (value === null) {
        return defaultValue;
    }

    return transform ? transform(value) : (value as unknown as T);
}

export function pushRouteWithQueryParams(path : string, curPath : string, router : AppRouterInstance) {
    const params = new URLSearchParams(window.location.search).toString();

    if (curPath === path) {
        router.push(`${path}?${params}`);
    }
    else {
        router.push(path);
    }
}

export const getQueryParamAsDate = (searchParams: URLSearchParams, prefix: string, fallback: Date) => {
    const year = searchParams.get(`${prefix}year`);
    const month = searchParams.get(`${prefix}month`);
    const day = searchParams.get(`${prefix}day`);

    if (year && month && day) {
        return new Date(Number(year), Number(month) - 1, Number(day));
    }
    return fallback;
};