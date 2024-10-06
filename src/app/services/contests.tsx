

export async function getContests(startIndex: number, count: number) {
    const fetcher = (url: string) => fetch(url).then(res => res.json());
    return await fetcher(`https://dl.gsu.by/etr/api/contest?index=${startIndex}&count=${count}`);
}