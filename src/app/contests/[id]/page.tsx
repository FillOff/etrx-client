'use client';
import { LinkParamType, NetTable, NetTableParams, TableProps } from "@/app/components/network-table";
import { getContestSubmissions } from "@/app/services/contests";
import { useParams } from "next/navigation";

export default function Page()
{
    const contestPageNumber = Number(useParams().id);
    
    function getData(params: NetTableParams)
    {
        return getContestSubmissions(contestPageNumber);
    }

    function contestTable()
    {
        const tableProps: TableProps = {
            getData: getData, 
            headTitles: ['Handle', 'Имя', 'Фамилия', 'Город', 'Организация', 'Класс', 'Всего решено'],
            dataField: 'submissions',
            disableSorting: true,
        };

        return(
            <>
                <NetTable props={tableProps}/>
            </>
        );
    }

    return(
        <>
            <h1 className=' text-3xl w-full text-center font-bold mb-5'>Таблица контеста #{contestPageNumber}</h1>
            {contestTable()}
        </>
    );
}