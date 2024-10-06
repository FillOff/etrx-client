"use client";
import { useEffect, useState } from "react";
import { getContests } from "../services/contests";
import PageSelector from "../components/page-selector";
import TableStyle from './table.module.css'

export default () =>
{
    const [data, setData] = useState<any>(null);
    const [page, setPage] = useState(1);
    
    if(data == null)
    {
        getContests(0, 10).then(res => {setData(res)});
    }

    function pageCallback(newPage: number)
    {
        if (newPage == page)
            return;

        setPage(newPage);
        let startIndex = 10 * (newPage - 1);
        getContests(startIndex, startIndex + 10).then(res => {setData(res)});
    }

    function contestTable()
    {
        if (!data)
            return <></>;
        const contests = Array.from(data['contests']);

        return(
            <>
            <div className={TableStyle.container}>
                <table className={TableStyle.table}>
                    <tbody>
                        {contests.map((entry: any) => 
                            <tr key={entry['id']}>
                                <td className='border-2 border-gray-500'>{entry['id']}</td>
                                <td className='border-2 border-gray-500'>{entry['name']}</td>
                                <td className='border-2 border-gray-500'>{new Date(entry['start_time_seconds']).toString()}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <PageSelector page={page} maxPage={10} pageCallback={pageCallback}/>
            </>
        );
    }

    return(
        <>
            {contestTable()}
        </>
    );
}