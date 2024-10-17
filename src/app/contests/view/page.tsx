"use client";
import { useEffect, useState } from "react";
import { getContestsJson, GetContestsJsonArgs, getContestsPageCount } from "../../services/contests";
import PageSelector from "../../components/page-selector";
import { ContestTable } from "../../components/contest-table";
import GizmoSpinner from "../../components/gizmo-spinner";
import { NetworkTable } from "@/app/components/network-table";

export default () =>
{
    const [data, setData] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState<number>(0);
    const recordsPerPage = 100;
    
    useEffect(() => {
        getContestsPageCount(recordsPerPage).then(res => {
            if(res)
                setMaxPage(res);
            else
                setMaxPage(1);
        })
    }, []);

    function pageCallback(newPage: number)
    {
        if (newPage == page)
            return;

        getContestsPageCount(recordsPerPage).then(res => {
            if(res)
            {
                setMaxPage(res);
                setPage(newPage);
            }
            else
            {
                setMaxPage(1);
                setPage(1);
            }
        })
        
    }

    function contestTable()
    {
        // Prevents from double-quering from NetworkTable because of maxPage updates
        if (maxPage == 0)
            return (
                <>
                    <PageSelector page={page} maxPage={maxPage} pageCallback={pageCallback}/>
                    {/* <div style={{margin: '10vh 0px'}}><GizmoSpinner/></div> */}
                </>
            )

        return(
            <>
                <PageSelector page={page} maxPage={maxPage} pageCallback={pageCallback}/>
                {/* <ContestTable data={data}></ContestTable> */}
                <NetworkTable 
                    usedRequest={getContestsJson} 
                    args={new GetContestsJsonArgs(page, recordsPerPage, null, "name", true)} 
                    dataField="contests" 
                    headTitles={['ID', 'Name', 'Start Date']}>
                </NetworkTable>
                <PageSelector page={page} maxPage={maxPage} pageCallback={pageCallback}/>
            </>
        );
    }

    return(
        <>
            <h1 className=' text-3xl w-full text-center font-bold mb-5'>Таблица контестов</h1>
            {contestTable()}
        </>
    );
}