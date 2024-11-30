import { useEffect, useState } from 'react';
import Styles from './network-table.module.css'
import PageSelector from './page-selector';

export class Entry
{
    cells: JSX.Element[] = [];
}

export class TableEntry
{
    public row: JSX.Element = <tr></tr>
}

export class TableProps
{
    constructor(
        public getData: (params: RequestProps) => Promise<{entries: TableEntry[], props: RequestProps}>, 
        public columnNames: string[],
    ) {}
    hidePageSelectors: boolean | undefined;
}

export class RequestProps
{
    page: number | null = null;
    maxPage: number | null = null;
    sortField: string | null = null;
    sortOrder: boolean | null = null;
    fieldKeys: string[] = [];
}

export function Table({props}: {props: TableProps})
{
    const [entries, setEntries] = useState<TableEntry[]>([]);
    const [rProps, setRProps] = useState(new RequestProps);

    function request()
    {
        props.getData(rProps).then(result => {
            setEntries(result.entries)
            setRProps(result.props);
        });
    }

    // TODO: figure out how to be responsive to new table properties
    // while avoiding double-fetching because of refresh of getData function
    useEffect(() => {
        request();
    }, [])

    function pageCallback(newPage: number)
    {
        const newRProps = rProps;
        newRProps.page = newPage;
        setRProps(newRProps);

        request();
    }

    function changeParams(fieldName: string | undefined)
    {
        // fieldsList.at(index) - check if field is sortable!
        if(fieldName)
        {
            const newRProps = rProps;
            
            // Reset sortOrder when choosing different field
            if (fieldName != newRProps.sortField)
            {
                newRProps.sortField = fieldName;
                newRProps.sortOrder = false;
                setRProps(newRProps);
            }
            else
            {
                newRProps.sortField = fieldName;
                newRProps.sortOrder = !rProps.sortOrder;
                setRProps(newRProps);
            }

            request();
        } 
    }
    
    return (
        <>
        <div className={Styles.container}>
            {!props.hidePageSelectors && entries.length > 0 && rProps.page && rProps.maxPage && 
                <PageSelector page={rProps.page} maxPage={rProps.maxPage} pageCallback={pageCallback}/>
            }
            <table className={Styles.table}>
                <thead>
                    <tr key={0}>
                    {props.columnNames.map((name, index) => {    
                        if (rProps.sortField != rProps.fieldKeys.at(index))
                            return(
                                <th key={index} className={Styles.th}
                                        onClick={() => changeParams(rProps.fieldKeys.at(index))}>
                                    {name}
                                </th>
                            )

                        if(rProps.sortOrder) 
                            return(
                                <th key={index} className={[Styles.th, Styles.cell_arrow_up].join(' ')}
                                        onClick={() => changeParams(rProps.fieldKeys.at(index))}>
                                    {name}
                                </th>
                            )
                        else
                            return(
                                <th key={index} className={[Styles.th, Styles.cell_arrow_down].join(' ')}
                                        onClick={() => changeParams(rProps.fieldKeys.at(index))}>
                                    {name}
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {entries.map(entry => entry.row)}
                </tbody>
            </table>
            {!props.hidePageSelectors != false && entries.length > 0 && rProps.page && rProps.maxPage && 
                <PageSelector page={rProps.page} maxPage={rProps.maxPage} pageCallback={pageCallback}/>
            }
        </div>
        </>
    )
}