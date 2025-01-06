'use client';
import { Entry, RequestProps, Table, TableEntry, TableProps } from "@/app/components/table";
import { getContestSubmissions, GetContestSubmissionsArgs, getContestSubmissionsWithUpdate } from "@/app/services/contests";
import { useParams } from "next/navigation";
import TableStyles from '../../components/network-table.module.css';
import { useMemo, useRef, useState } from "react";
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { RadioGroup, Option } from "../../components/contest-radiogroup";

export default function Page()
{
    const [participantType, setParticipantType] = useState('CONTESTANT');
    // Contest ID for which we request submissions.
    const contestId = Number(useParams().id);
    // Stores response status code, used for hiding the table, showing spinner
    // and possible error messages
    const [statusCode, setStatusCode] = useState(0);
    // Used to determine, if we need to POST an update to the server
    const firstUpdate = useRef(true);
    const tableProps = new TableProps(
        ['Имя', 'Фамилия', 'Город', 'Организация', 'Класс', 'Всего решено']
    );

    async function getData(props: RequestProps)
    {  
        // Prepare request parameters and other properties
        props.page = null;
        props.maxPage = null;
        props.sortField = props.sortField ? props.sortField : 'solvedCount';
        props.sortOrder = props.sortOrder != null ? props.sortOrder : false;
        const args = new GetContestSubmissionsArgs(
            contestId,
            props.sortField,
            props.sortOrder,
            participantType
        );

        // Get raw data
        let response: Response;
        try
        {
            if(firstUpdate.current)
            {
                response = await getContestSubmissionsWithUpdate(args);
                firstUpdate.current = false;
            }
            else
            {
                response = await getContestSubmissions(args);
            }
        } 
        catch(error)
        {
            setStatusCode(-1);
            return {entries: [], props: props};
        }

        const data = await response.json();
        const rawEntries = Array.from(data['submissions']);

        // Set status code to track request state
        setStatusCode(response.status);

        // Set field keys that we got
        if(rawEntries[0])
            props.fieldKeys = Object.keys(rawEntries[0])
                .filter(key => key != 'handle' && key != 'participantType');

        // Append problem indexes into table names
        const newIndexes: string[] = []
        data['problemIndexes'].forEach((elem: string) => {
            newIndexes.push(elem);
        });
        tableProps.columnNames = 
            ['Имя', 'Фамилия', 'Город', 'Организация', 'Класс', 'Всего решено'].concat(newIndexes);
        
        // Create viewable content from raw data
        const entries: TableEntry[] = [];
        rawEntries.forEach((raw: any, i) => {
            const len = Object.keys(raw).length;
            const entry: Entry = new Entry();

            entry.cells = Array(len);
            let rawKeys = Object.keys(raw)
                .filter(key => (key != 'handle') && (key != 'participantType'));
                
            rawKeys.forEach((key, i) =>
            {

                if(key == 'tries')
                {
                    data['problemIndexes'].forEach((elem: string, index: number) => {
                        entry.cells.push(
                            <td key={i + index} className={TableStyles.cell}>{raw['tries'][index]}</td>
                        );     
                    });
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

    const table = useMemo(() => {
        return (
            <>
            <div>
                <Table getData={getData} props={tableProps}></Table>
            </div>          
            </>
        )
    }, [participantType])

    const participantFilterOptions: Option[] = [
        { label: 'ALL', value: 'ALL' },
        { label: 'CONTESTANT', value: 'CONTESTANT' },
        { label: 'PRACTICE', value: 'PRACTICE' },
        { label: 'VIRTUAL', value: 'VIRTUAL' },
        { label: 'OUT_OF_COMPETITION', value: 'OUT_OF_COMPETITION' },
    ]

    return(
        <>
            <h1 className=' text-3xl w-full text-center font-bold mb-5'>Таблица контеста #{contestId}</h1>
            <RadioGroup 
                title="Фильтр участия"
                options={participantFilterOptions}
                name="participantTypeFilter"
                value={participantType}
                onChange={setParticipantType}
            />
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
    );
}