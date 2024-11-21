"use client";
import { Suspense } from "react";
import { getContests, GetContestsArgs } from "../../services/contests";
import { LinkParamType, NetTable, NetTableParams, TableProps } from "@/app/components/network-table";

export default function Page()
{

    function getData(params: NetTableParams)
    {   
        const args = new GetContestsArgs(
            params.page,
            params.pageSize,
            params.sortField,
            params.sortOrder,
            null
        )
        return getContests(args);
    }

    function contestTable()
    {
        const tableProps: TableProps = {
            getData: getData, 
            headTitles: ['ID', 'Название', 'Время начала'],
            dataField: 'contests',
            link: '/etrx2/contests',
            paramType: LinkParamType.Appended,
            linkAppendedParamField: 'contestId'
        };

        return(
            <Suspense>
                <NetTable props={tableProps}/>
            </Suspense>
        );
    }

    return(
        <>
            <h1 className=' text-3xl w-full text-center font-bold mb-5'>Таблица контестов</h1>
            {contestTable()}
        </>
    );
}