'use client';

import { Entry, RequestProps, Table, TableEntry, TableProps } from "@/app/components/table";
import { useState, useMemo, Suspense, useEffect } from "react";
import TableStyles from '@/app/components/network-table.module.css';
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { useTranslation } from "react-i18next";
import '../../i18n/client';
import { getSubmissionsProtocol, GetSubmissionsProtocolArgs } from "../services/submissions";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter, useSearchParams } from 'next/navigation';
import { getQueryParam, setQueryParams } from '@/lib/utils';

function PageLogic() {
    const { t, i18n } = useTranslation();
    const [statusCode, setStatusCode] = useState(0);
    const router = useRouter();
    const searchParams = useSearchParams();

    const [fYear, setFYear] = useState<number>(getQueryParam('fyear', new Date().getFullYear(), searchParams, Number));
    const [fMonth, setFMonth] = useState<number>(getQueryParam('fmonth', new Date().getMonth() + 1, searchParams, Number));
    const [fDay, setFDay] = useState<number>(getQueryParam('fday', new Date().getDate(), searchParams, Number));
    const [tYear, setTYear] = useState<number>(getQueryParam('tyear', new Date().getFullYear(), searchParams, Number));
    const [tMonth, setTMonth] = useState<number>(getQueryParam('tmonth', new Date().getMonth() + 1, searchParams, Number));
    const [tDay, setTDay] = useState<number>(getQueryParam('tday', new Date().getDate(), searchParams, Number));
    const [contestId, setContestId] = useState<number | null>(getQueryParam('contestid', null, searchParams, Number));

    const fromDate = useMemo(() => new Date(fYear, fMonth - 1, fDay), [fYear, fMonth, fDay]);
    const toDate = useMemo(() => new Date(tYear, tMonth - 1, tDay), [tYear, tMonth, tDay]);

    const [debouncedFilters, setDebouncedFilters] = useState({fYear, fMonth, fDay, tYear, tMonth, tDay, contestId});

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilters({fYear, fMonth, fDay, tYear, tMonth, tDay, contestId});
        }, 250);

        return () => clearTimeout(handler);
    }, [fYear, fMonth, fDay, tYear, tMonth, tDay, contestId]);

    async function getData(props: RequestProps)
    {
        setQueryParams({ 
            fyear: fYear, fmonth: fMonth, fday: fDay,
            tyear: tYear, tmonth: tMonth, tday: tDay,
            contestid: contestId
        }, router);

        props.page = props.page ? props.page : 1;
        let args = new GetSubmissionsProtocolArgs(
            fYear, fMonth, fDay,
            tYear, tMonth, tDay,
            contestId
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

        let data = await response.json();
        const rawEntries = Array.from(data);

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
                entry.cells.push(<td key={i} className={TableStyles.cell}>{raw[key]}</td>);
            });

            const tEntry = new TableEntry;
            tEntry.row = <tr key={i} className={TableStyles.tr}>{entry.cells}</tr>;
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
        t('protocol:tableHeaders.userName'),
        t('protocol:tableHeaders.contestId'),
        t('protocol:tableHeaders.totalSolved')
      ]);
    
    const table = useMemo(() => {
        return (
            <div>
                <Table getData={getData} props={tableProps}></Table>
            </div>          
        )
    }, [i18n.language, debouncedFilters])

    const filter = useMemo(() => {
        return (
            <div className='m-auto rounded-md h-fit px-4 py-2 w-fit bg-background-shade'>
                <div className="text-center">{t("protocol:filtersTitle")}</div>
                <div className="flex">
                    <label htmlFor="fromDate">{t('protocol:filters.fromDate')}</label>
                    <DatePicker 
                        id='fromDate'
                        onChange={(date) => {
                            if (date != null) {
                                setFYear(date!.getFullYear());
                                setFMonth(date!.getMonth() + 1);
                                setFDay(date!.getDate());
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
                            if (date != null) 
                            {
                                setTYear(date!.getFullYear());
                                setTMonth(date!.getMonth() + 1);
                                setTDay(date!.getDate());
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
                            setContestId(e.target.value === "" ? null : Number(e.target.value));
                        }}
                        className="border-[1.5px] w-[200px] border-solid border-black rounded-[6px] pl-[5px] pr-[5px] pt-[2px] pb-[2px] bg-[--background] ml-[5px]"
                    />
                </div>
            </div>
        )
    }, [i18n.language, fromDate, toDate, contestId]);

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

export default function Page() {
    return (
        <Suspense>
            <PageLogic />
        </Suspense>
    );
}