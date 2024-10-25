"use client";
import { getContests, GetContestsArgs, getContestsPageCount } from "../../services/contests";
import { LinkParamType, NetTable, NetTableParams, TableProps } from "@/app/components/network-table";

export default () =>
{
    function getData(params: NetTableParams)
    {
        console.log()
        let args = new GetContestsArgs(
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
        let tableProps: TableProps = {
            getData: getData, 
            headTitles: ['ID', 'Название', 'Время начала'],
            dataField: 'contests',
            link: 'https://codeforces.com/contests',
            paramType: LinkParamType.Appended,
            linkAppendedParamField: 'contestId'
        };

        return(
            <>
                <NetTable props={tableProps}/>
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