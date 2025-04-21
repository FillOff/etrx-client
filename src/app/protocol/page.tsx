'use client';

import { Entry, RequestProps, Table, TableEntry, TableProps } from "@/app/components/table";
import { useState, useMemo, useEffect } from "react";
import TableStyles from '@/app/components/network-table.module.css';
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { useTranslation } from "react-i18next";
import '../../i18n/client';
import { getSubmissionsProtocol, GetSubmissionsProtocolArgs } from "../services/submissions";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter, useSearchParams } from 'next/navigation';

export default function Page()
{
    const { t, i18n } = useTranslation();
    const [statusCode, setStatusCode] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const [fYear, setFYear] = useState<number>(
        searchParams.get('fyear') != null ? Number(searchParams.get('fyear')) : new Date().getFullYear()!
    );
    const [fMonth, setFMonth] = useState<number>(
        searchParams.get('fmonth') ? Number(searchParams.get('fmonth')) : new Date()?.getMonth()! + 1
    );
    const [fDay, setFDay] = useState<number>(
        searchParams.get('fday') ? Number(searchParams.get('fday')) : new Date()?.getDate()!
    );
    const [tYear, setTYear] = useState<number>(
        searchParams.get('tyear') ? Number(searchParams.get('tyear')) : new Date()?.getFullYear()!
    );
    const [tMonth, setTMonth] = useState<number>(
        searchParams.get('tmonth') ? Number(searchParams.get('tmonth')) : new Date()?.getMonth()! + 1
    );
    const [tDay, setTDay] = useState<number>(
        searchParams.get('tday') ? Number(searchParams.get('tday')) : new Date()?.getDate()!
    );
    const [contestId, setContestId] = useState<number | null>(
        searchParams.get('contestid') ? Number(searchParams.get('contestid')) : null
    );

    const [fromDate, setFromDate] = useState<Date | null>(new Date(fYear, fMonth-1, fDay));
    console.log(fromDate);
    const [toDate, setToDate] = useState<Date | null>(new Date(tYear, tMonth-1, tDay));

    useEffect(() => {
        setIsClient(true);
    }, []);

    async function getData(props: RequestProps)
    {
        const params = new URLSearchParams(window.location.search);
        params.set('fyear', String(fYear));
        params.set('fmonth', String(fMonth));
        params.set('fday', String(fDay));
        params.set('tyear', String(tYear));
        params.set('tmonth', String(tMonth));
        params.set('tday', String(tDay));
        if (contestId != null) {
            params.set('contestid', String(contestId));
        }
        router.push(`?${params.toString()}`);

        props.page = props.page ? props.page : 1;
        const args = new GetSubmissionsProtocolArgs(
            fYear, fMonth, fDay,
            tYear, tMonth, tDay,
            contestId,
            props.page,
            100
        )

        let response : Response;
        try
        {
            response = await getSubmissionsProtocol(args);
        }
        catch (error)
        {
            setStatusCode(-1);
            return { entries: [], props: props };
        }

        const data = await response.json();
        const rawEntries = Array.from(data.submissions);

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
                if (key == 'creationTimeSeconds') {
                    raw[key] = unixToFormattedDate(raw[key]);
                }
                else if (key == 'timeConsumedMillis') {
                    raw[key] = `${raw[key]}ms`;
                }
                else if (key == 'memoryConsumedBytes') {
                    raw[key] = `${raw[key]} Bytes`;
                }
                
                entry.cells.push(<td key={i} className={TableStyles.cell}>{raw[key]}</td>);
            });

            const tEntry = new TableEntry;
            tEntry.row = <tr key={i} className={TableStyles.tr}>
                {entry.cells}
            </tr>;
            entries.push(tEntry);
        });

        return { entries: entries, props: props };
    }

    function unixToFormattedDate(unixTime: number): string {
        const months = [
            t('common:months.january'), t('common:months.february'), t('common:months.march'),
            t('common:months.april'), t('common:months.may'), t('common:months.june'),
            t('common:months.july'), t('common:months.august'), t('common:months.september'),
            t('common:months.october'), t('common:months.november'), t('common:months.december')
        ];

        const date = new Date(unixTime * 1000);

        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${month} ${day} ${year}, ${hours}:${minutes}:${seconds}`;
    }

    const tableProps = new TableProps([
        t('protocol:tableHeaders.id'),
        t('protocol:tableHeaders.creationTimeSeconds'),
        t('protocol:tableHeaders.firstName'),
        t('protocol:tableHeaders.lastName'),
        t('protocol:tableHeaders.contestId'),
        t('protocol:tableHeaders.index'),
        t('protocol:tableHeaders.participantType'),
        t('protocol:tableHeaders.programmingLanguage'),
        t('protocol:tableHeaders.verdict'),
        t('protocol:tableHeaders.timeConsumedMillis'),
        t('protocol:tableHeaders.memoryConsumedBytes')
      ]);
    
    const table = useMemo(() => {
        if (!isClient) return null;

        return (
            <>
            <div>
                <Table getData={getData} props={tableProps}></Table>
            </div>          
            </>
        )
    }, [i18n.language, isClient, fYear, fMonth, fDay, tYear, tMonth, tDay, contestId])

    const filter = useMemo(() => {
        
        return (
            <>
                <div className='m-auto rounded-md h-fit px-4 py-2 w-fit bg-background-shade'>
                    <div className="text-center">{t("protocol:filtersTitle")}</div>
                    <div className="flex">
                        <label htmlFor="fromDate">{t('protocol:filters.fromDate')}</label>
                        <DatePicker 
                            id='fromDate'
                            onChange={(date) => {
                                setFromDate(date);
                                if (date != null) {
                                    setFYear(date!.getFullYear());
                                    setFMonth(date!.getMonth() + 1);
                                    setFDay(date!.getDate());

                                    const params = new URLSearchParams(window.location.search);
                                    params.set('fyear', String(date!.getFullYear()));
                                    params.set('fmonth', String(date!.getMonth() + 2));
                                    params.set('fday', String(date!.getDate()));
                                    router.push(`?${params.toString()}`);
                                }
                            }}
                            selected={fromDate}
                            shouldCloseOnSelect={false}
                            dateFormat="dd.MM.yyyy"
                            placeholderText={t("protocol:filters.selectDate")}
                            className="border-[1.5px] w-[200px] border-solid border-black rounded-[6px] pl-[5px] pr-[5px] pt-[2px] pb-[2px] bg-[--background] mr-[10px] ml-[5px]"
                        />
                        <label htmlFor="toDate">{t('protocol:filters.toDate')}</label>
                        <DatePicker 
                            id='toDate'
                            onChange={(date) => {
                                setToDate(date);
                                if (date != null) 
                                {
                                    setTYear(date!.getFullYear());
                                    setTMonth(date!.getMonth() + 1);
                                    setTDay(date!.getDate());

                                    const params = new URLSearchParams(window.location.search);
                                    params.set('tyear', String(date!.getFullYear()));
                                    params.set('tmonth', String(date!.getMonth() + 2));
                                    params.set('tday', String(date!.getDate()));
                                    router.push(`?${params.toString()}`);
                                }
                            }}
                            selected={toDate}
                            shouldCloseOnSelect={false}
                            dateFormat="dd.MM.yyyy"
                            placeholderText={t("protocol:filters.selectDate")}
                            className="border-[1.5px] w-[200px] border-solid border-black rounded-[6px] pl-[5px] pr-[5px] pt-[2px] pb-[2px] bg-[--background] mr-[10px] ml-[5px]"
                        />
                        <label htmlFor="setContestId">{t('protocol:filters.setContestId')}</label>
                        <input 
                            id='setContestId'
                            type='number'
                            min={0}
                            value={contestId == null ? "" : contestId}
                            onChange={(e) => {
                                const value = e.target.value;
                                const params = new URLSearchParams(window.location.search);

                                if (value === "") {
                                    setContestId(null);
                                    params.delete('contestid');
                                }
                                else {
                                    setContestId(Number(value));
                                    params.set('contestid', e.target.value);
                                }
                                
                                router.push(`?${params.toString()}`);
                            }}
                            className="border-[1.5px] w-[200px] border-solid border-black rounded-[6px] pl-[5px] pr-[5px] pt-[2px] pb-[2px] bg-[--background] ml-[5px]"
                        />
                    </div>
                </div>
            </>
        )
    }, [i18n.language, fromDate, toDate, contestId])

    if (!isClient) {
        return <GizmoSpinner />;
    }

    return(
        <>
            <h1 className='text-3xl w-full text-center font-bold mb-5'>{t('protocol:protocolTableTitle')}</h1>
            {filter}
            {statusCode == 0 && <div className='mb-[150px]'><GizmoSpinner></GizmoSpinner></div>}
            {statusCode != 200 && statusCode != 0 && 
                <h1 className="w-full text-center text-2xl font-bold">
                    {t('common:error', { statusCode })}
                </h1>
            }
            <div className={statusCode == 200 ? 'visible' : 'invisible'}>
                {table}
            </div>
        </>
    )
}