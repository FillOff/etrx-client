"use client";
import { useEffect, useState } from "react";
import { getContests } from "../../services/contests";
import PageSelector from "../../components/page-selector";
import TableStyle from './table.module.css'
import { ContestTable, CTcell, CTrow } from "../../components/contest-table";
import GizmoSpinner from "../../components/gizmo-spinner";

export default () =>
{
    const [data, setData] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [loadingData, setLoadingData] = useState(false);
    
    if(data == null && !loadingData)
    {
        getContests(0, 10).then(res => {
            setData(res);
            setLoadingData(false);
        });
        setLoadingData(true);
    }

    function pageCallback(newPage: number)
    {
        if (newPage == page)
            return;

        setPage(newPage);
        let startIndex = 10 * (newPage - 1);
        setLoadingData(true);
        getContests(startIndex, startIndex + 10).then(res => {
            setData(res);
            setLoadingData(false);
        });
    }

    function contestTable()
    {
        if (!data || loadingData)
            return (
                <>
                    <PageSelector page={page} maxPage={10} pageCallback={pageCallback}/>
                    {loadingData? <div style={{margin: '10vh 0px'}}><GizmoSpinner/></div> : <></>} 
                </>
            )

        return(
            <>
                <PageSelector page={page} maxPage={10} pageCallback={pageCallback}/>
                <ContestTable data={data}></ContestTable>
                <PageSelector page={page} maxPage={10} pageCallback={pageCallback}/>
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