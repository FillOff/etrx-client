'use client';

import { Suspense, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getSubmissionsProtocol, GetSubmissionsProtocolArgs } from "../services/submissions";
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { Table } from "@/app/components/Table";
import { Column } from "@/app/models/TableTypes";
import { ProtocolForTable, SubmissionProtocol } from "../models/Submission";
import { useQueryState } from "@/hooks/useQueryState";
import { useDebounce } from "@/hooks/useDebounce";

function ProtocolClientPage() {
    const { t } = useTranslation('protocol');
    
    const defaultFilters = useMemo(() => {
        const now = new Date();
        return {
            fyear: now.getFullYear(),
            fmonth: now.getMonth() + 1,
            fday: now.getDate(),
            tyear: now.getFullYear(),
            tmonth: now.getMonth() + 1,
            tday: now.getDate(),
            contestid: null,
        };
    }, []);

    const { searchParams, setQueryParams } = useQueryState(defaultFilters);

    const isMounted = useRef(true);
    const [submissions, setSubmissions] = useState<SubmissionProtocol[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fromDate = useMemo(() => {
        const year = searchParams.get('fyear');
        const month = searchParams.get('fmonth');
        const day = searchParams.get('fday');
        
        if (year && month && day) {
            return new Date(Number(year), Number(month) - 1, Number(day));
        }

        return new Date();
    }, [searchParams]);

    const toDate = useMemo(() => {
        const year = searchParams.get('tyear');
        const month = searchParams.get('tmonth');
        const day = searchParams.get('tday');

        if (year && month && day) {
            return new Date(Number(year), Number(month) - 1, Number(day));
        }
        
        return new Date();
    }, [searchParams]);

    const contestId = useMemo(() => {
        const id = searchParams.get('contestid');
        return id ? Number(id) : null;
    }, [searchParams]);
    
    const filters = useMemo(() => ({
        fYear: fromDate.getFullYear(),
        fMonth: fromDate.getMonth() + 1,
        fDay: fromDate.getDate(),
        tYear: toDate.getFullYear(),
        tMonth: toDate.getMonth() + 1,
        tDay: toDate.getDate(),
        contestId,
    }), [fromDate, toDate, contestId]);

    const debouncedFilters = useDebounce(filters, 500);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const { fYear, fMonth, fDay, tYear, tMonth, tDay, contestId } = debouncedFilters;
        const args = new GetSubmissionsProtocolArgs(fYear, fMonth, fDay, tYear, tMonth, tDay, contestId);

        try {
            const response = await getSubmissionsProtocol(args);
            if (!isMounted.current) return;
            if (!response.ok) throw new Error(t('common:error', { statusCode: response.status }));
            
            const data = await response.json();
            setSubmissions(data || []);
        } catch (err) {
            if (!isMounted.current) return;
            setError(err as Error);
            setSubmissions([]);
        } finally {
            if (!isMounted.current) return;
            setIsLoading(false);
        }
    }, [debouncedFilters, t]);

    useEffect(() => {
        isMounted.current = true;
        fetchData();
        return () => { isMounted.current = false; };
    }, [fetchData]);
    
    const handleFromDateChange = (date: Date | null) => {
        if (date) {
            setQueryParams({
                fyear: date.getFullYear(),
                fmonth: date.getMonth() + 1,
                fday: date.getDate(),
            });
        }
    };
    
    const handleToDateChange = (date: Date | null) => {
        if (date) {
            setQueryParams({
                tyear: date.getFullYear(),
                tmonth: date.getMonth() + 1,
                tday: date.getDate(),
            });
        }
    };

    const handleContestIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQueryParams({ contestid: e.target.value === "" ? null : Number(e.target.value) });
    };

    const columns: Column<ProtocolForTable>[] = useMemo(() => [
        { key: 'userName', header: t('protocol:tableHeaders.userName'), accessor: 'userName', isSortable: false },
        { key: 'contestId', header: t('protocol:tableHeaders.contestId'), accessor: 'contestId', isSortable: false },
        { key: 'solvedCount', header: t('protocol:tableHeaders.solvedCount'), accessor: 'solvedCount', isSortable: false },
    ], [t]);

    const tableData: ProtocolForTable[] = submissions.map(sub => ({ ...sub, id: sub.userName }));

    return (
        <>
            <h1 className='text-3xl w-full text-center font-bold mb-5'>{t('protocol:protocolTableTitle')}</h1>
            
            <div className='m-auto rounded-md h-fit px-4 py-2 w-fit bg-background-shade'>
                <div className="text-center">{t("protocol:filtersTitle")}</div>
                <div className="flex items-center">
                    <label htmlFor="fromDate" className="mr-2">{t('protocol:filters.fromDate')}</label>
                    <DatePicker 
                        id='fromDate'
                        selected={fromDate}
                        onChange={handleFromDateChange}
                        dateFormat="dd.MM.yyyy"
                        className="border-[1.5px] w-[150px] border-solid border-black rounded-[6px] px-2 py-1 bg-[--background] mr-4"
                    />
                    <label htmlFor="toDate" className="mr-2">{t('protocol:filters.toDate')}</label>
                    <DatePicker 
                        id='toDate'
                        selected={toDate}
                        onChange={handleToDateChange}
                        dateFormat="dd.MM.yyyy"
                        className="border-[1.5px] w-[150px] border-solid border-black rounded-[6px] px-2 py-1 bg-[--background] mr-4"
                    />
                    <label htmlFor="setContestId" className="mr-2">{t('protocol:filters.setContestId')}</label>
                    <input 
                        id='setContestId'
                        type='number'
                        min={0}
                        value={contestId ?? ""}
                        onChange={handleContestIdChange}
                        className="border-[1.5px] w-[150px] border-solid border-black rounded-[6px] px-2 py-1 bg-[--background]"
                    />
                </div>
            </div>

            <Table
                columns={columns}
                data={tableData}
                isLoading={isLoading}
                error={error}
            />
        </>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<GizmoSpinner />}>
            <ProtocolClientPage />
        </Suspense>
    );
}