"use client";
import { Entry, RequestProps, Table, TableEntry, TableProps } from "@/app/components/table";
import { getIndexes, getProblems, GetProblemsArgs, getTags } from "@/app/services/problems";
import { useState, useMemo } from "react";
import TableStyles from '@/app/components/network-table.module.css';
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { GetDivTagsList } from "@/app/components/problem-tags";
import { TagsFilter } from "@/app/components/tags-filter";

export default function Page()
{
    const [statusCode, setStatusCode] = useState(0);
    const [tags, setTags] = useState<string[]>([]);
    const [indexes, setIndexes] = useState<string[]>([]);

    async function getData(props: RequestProps)
    {
        props.page = props.page ? props.page : 1;
        props.sortField = props.sortField ? props.sortField : 'contestId';
        props.sortOrder = props.sortOrder != null ? props.sortOrder : false;
        const args = new GetProblemsArgs(
            props.page,
            100,
            props.sortField,
            props.sortOrder,
            tags,
            indexes
        )

        let response : Response;
        try
        {
            response = await getProblems(args);
        }
        catch (error)
        {
            setStatusCode(-1);
            return { entries: [], props: props };
        }

        const data = await response.json();
        const rawEntries = Array.from(data.problems);

        // Set status code to track request state
        setStatusCode(response.status);

        // Set new page that we got from response
        if(data['pageCount'] && typeof(data['pageCount']) == 'number')
            props.maxPage = data['pageCount'];

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
                if (key == 'tags')
                {
                    const tags = GetDivTagsList(raw[key]);
                    entry.cells.push(<td key={i} className={TableStyles.cell}>{tags}</td>);
                }
                else
                {
                    entry.cells.push(<td key={i} className={TableStyles.cell}>{raw[key]}</td>);
                }
            });

            const tEntry = new TableEntry;
            tEntry.row = <tr key={i} className={TableStyles.tr_link}
            onClick={() => window.open(`https://codeforces.com/problemset/problem/${raw['contestId']}/${raw['index']}`)}>
                {entry.cells}
            </tr>;
            entries.push(tEntry);
        });

        return { entries: entries, props: props };
    }

    async function getTagsList()
    {
        let response : Response;
        try
        {
            response = await getTags();
        }
        catch (error)
        {
            setStatusCode(-1);
            return { tags: [] };
        }

        const data: string[] = await response.json();
        
        return { tags: data }
    }

    async function getIndexesList()
    {
        let response : Response;
        try
        {
            response = await getIndexes();
        }
        catch (error)
        {
            setStatusCode(-1);
            return { indexes: [] };
        }

        const data: string[] = await response.json();
        
        return { indexes: data }
    }

    const tableProps = new TableProps(
        ['ID', 'Контест', 'Индекс', 'Имя', 'Очки', 'Рейтинг', 'Теги']
    );

    const table = useMemo(() => {
        return (
            <>
            <div>
                <Table getData={getData} props={tableProps}></Table>
            </div>          
            </>
        )
    }, [tags, indexes])

    const tagsFilter = useMemo(() => {
        return (
            <>
                <TagsFilter 
                    getTags={getTagsList} selTags={tags} onChangeTags={setTags}
                    getIndexes={getIndexesList} selIndexes={indexes} onChangeIndexes={setIndexes}/>
            </>
        )
    }, [tags, indexes])
    
    return(
        <>
            {tagsFilter}
            <h1 className='text-3xl w-full text-center font-bold mb-5'>Таблица задач</h1>
            {statusCode == 0 && <div className='mb-[150px]'><GizmoSpinner></GizmoSpinner></div>}
            {statusCode != 200 && statusCode != 0 && 
                <h1 className="w-full text-center text-2xl font-bold">
                    Could not load table data. Status code: {statusCode}
                </h1>
            }
            <div className={statusCode == 200 ? 'visible' : 'invisible'}>
                {table}
            </div>
        </>
    )
}