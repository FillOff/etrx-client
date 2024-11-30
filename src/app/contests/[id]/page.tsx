'use client';
import { Entry, RequestProps, Table, TableEntry, TableProps } from "@/app/components/table";
import { getContestSubmissionsNew } from "@/app/services/contests";
import { useParams } from "next/navigation";
import TableStyles from '../../components/network-table.module.css';

export default function Page()
{
    // Set contest ID as arguments for request
    const args = Number(useParams().id);

    async function getData(props: RequestProps)
    {  
        // Prepare request parameters and other properties
        props.page = null;
        props.maxPage = null;
        props.sortField = props.sortField ? props.sortField : 'solvedCount';
        props.sortOrder = props.sortOrder ? props.sortOrder : false;

        // Get raw data
        let response: Response;
        try
        {
            response = await getContestSubmissionsNew(args);
        } 
        catch(error)
        {
            // setStatusCode(-1);
            return {entries: [], props: props};
        }

        const data = await response.json();
        const rawEntries = Array.from(data['submissions']);

        // Set status code to track request state
        // setStatusCode(response.status);

        // Set field keys that we got
        if(rawEntries[0])
            props.fieldKeys = Object.keys(rawEntries[0]);
        
        // Create viewable content from raw data
        const entries: TableEntry[] = [];
        rawEntries.forEach((raw: any, i) => {
            const len = Object.keys(raw).length;
            const entry: Entry = new Entry();

            entry.cells = Array(len);
            Object.keys(raw).forEach((key, i) =>
            {
                if(key == 'tries')
                {
                    entry.cells.push(
                        <td key={i} className={TableStyles.cell}>
                            {raw['tries'].map((elem: any, index: number) => {
                                return (<div>{data.problemIndexes[index]}: {elem}</div>);
                            })}
                        </td>
                    );
                    return;
                }
                entry.cells.push(<td key={i} className={TableStyles.cell}>{raw[key]}</td>);
            });

            const tEntry = new TableEntry;
            tEntry.row = <tr key={i} className={TableStyles.tr}>
                {entry.cells}
            </tr>;
            entries.push(tEntry);
        });

        return {entries: entries, props: props};
    }

    function contestTable()
    {
        const tableProps = new TableProps(
            getData, 
            ['Хендл', 'Имя', 'Фамилия', 'Город', 'Организация', 'Класс', 'Всего решено', 'Тип участия', 'Попытки']
        );

        // Display table and hide it if status code is not 200
        return(
            <>
            <Table props={tableProps}></Table>
            </>            
        );
    }

    return(
        <>
            <h1 className=' text-3xl w-full text-center font-bold mb-5'>Таблица контеста #{args}</h1>
            {contestTable()}
        </>
    );
}