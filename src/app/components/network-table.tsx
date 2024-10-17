import { useEffect, useState } from 'react';
import Styles from './network-table.module.css'
import Sortable from '../models/Sortable';

type Props = {
    children?: React.ReactNode,
    onClick?: (e: React.MouseEvent) => void
}

type TableProps = {
    usedRequest: (...args: any) => Promise<any>,
    args: Sortable,
    headTitles: string[],       // Table head titles
    dataField: string,          // Key of a field that contains data in the request
}

export function NTrow ({children, onClick}: Props)
{
    return (
        <tr className={Styles.row} onClick={onClick}>
            {children}
        </tr>
    )
}

export function NTcell ({children, onClick}: Props)
{
    return (
        <td className={Styles.cell} onClick={onClick}>
            {children}
        </td>
    )
}

export function NetworkTable ({usedRequest, args, headTitles, dataField}: TableProps)
{
    const request = usedRequest;
    const [data, setData] = useState<any>(null);
    // Argument for request, inherits Sortable
    const [oldArgs, setOldArgs] = useState<Sortable>();
    // Params for sorting
    const [sortParams, setSortParams] = useState<Sortable>();
    // Needed to prevent double fetching from useEffect for parameters state change
    const [firstLoad, setFirstLoad] = useState(true);
    let message = '';

    // Setting initial sorting parameters
    useEffect(() => {
        if(!sortParams)
            setSortParams(args as Sortable);
    }, [args]);

    // Making request when sorting parameters change
    useEffect(() => {
        console.log(sortParams);
        if(sortParams)
        {
            args.sortOrder = sortParams.sortOrder;
            args.sortFieldName = sortParams.sortFieldName;
            console.log(sortParams);
            if(!firstLoad)
            {
                console.log(sortParams);
                request(args).then((res: any) => {
                    res[dataField]? setData(Array.from(res[dataField])) : setData(null); 
                    message = res.message? res.message : ''
                });
            }
            setFirstLoad(false);
        }
    }, [sortParams]);

    // Making request when arguments change
    useEffect(() => {
        if(oldArgs != args)
        {
            if(sortParams)
            {
                args.sortOrder = sortParams.sortOrder;
                args.sortFieldName = sortParams.sortFieldName;
            }
            console.log(args)
            
            request(args).then((res: any) => {
                res[dataField]? setData(Array.from(res[dataField])) : setData(null); 
                message = res.message? res.message : ''
            });
            setOldArgs(args);
        }
    }, [args]);

    if(message === 'Fetch failed')
        return (
            <h1 className='text-center text-lg mt-5 mb-5'>
                Sorry, remote data is not available. <br/>
                Check your connection.
            </h1>
        )

    if(!data)
        return (
            <h1 className='text-center text-lg mt-5 mb-5'>
                Data invalid.
            </h1>
        )
    // Handle empty case
    if(data.length == 0)
        return (
            <h1 className='text-center text-lg mt-5 mb-5'>
                Table appears to be empty.
            </h1>
        )
    // All fields should be the same, or else...
    if(!data[0])
        return (
            <h1 className='text-center text-lg mt-5 mb-5'>
                Table appears to be ill-formed.
            </h1>
        )
    
    const fieldsList = Object.keys(data[0]);
    // Fill in the gaps for head titles using data keys
    const combinedTitles = headTitles.filter((elem, index) => 
        {return index < fieldsList.length? elem : null}).concat(
            fieldsList.filter((elem, index) => 
                {return index >= headTitles.length? elem : null})
        )

    return (
        <div className={Styles.container}>
            <table className={Styles.table}>
                <thead>
                    <tr key='0'>
                    {combinedTitles.map((title, index) =>
                        <th key={index} 
                            className={fieldsList.at(index) !== sortParams?.sortFieldName? Styles.th : 
                                sortParams?.sortOrder? [Styles.th, Styles.cell_arrow_up].join(' ') : [Styles.th, Styles.cell_arrow_down].join(' ')
                            } 
                            onClick={() => changeParams(fieldsList.at(index))}>

                            {title}
                        </th>
                    )}
                    </tr>
                </thead>
                <tbody>
                    {data.map((record: any, index: number) => 
                        <NTrow key={index}>
                            {Object.keys(record).map((key: string) => 
                                <NTcell key={key}>{record[key]}</NTcell>
                            )}
                        </NTrow>
                    )}
                </tbody>
            </table>
        </div>
    )

    function changeParams(fieldName: string | undefined)
    {
        // fieldsList.at(index) - check if field is sortable!
        if(sortParams && fieldName)
        {
            // Reset sortOrder when choosing different field
            if (fieldName != sortParams.sortFieldName)
            {
                setSortParams(new Sortable(fieldName, false));
                return;
            }
            
            setSortParams(new Sortable(fieldName, !sortParams.sortOrder));
        }
    }
}