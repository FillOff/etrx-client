'use client';

import { Suspense, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";
import { getHandleContestProtocol, GetHandleContestProtocolArgs } from "../../../services/submissions";
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { Table } from "@/app/components/Table";
import { Column } from "@/app/models/TableTypes";
import { HandleContestProtocol, HandleContestProtocolForTable } from "../../../models/Submission";
import { useParams, useSearchParams } from "next/navigation";
import { User } from "@/app/models/User";
import { getUser } from "@/app/services/users";
import { Contest } from "@/app/models/Contest";
import { getContest } from "@/app/services/contests";

function ProtocolClientPage() {
    const { t } = useTranslation('protocol');

    const handle = String(useParams().handle);
    const contestId = Number(useParams().contestId);

    const searchParams = useSearchParams();

    const fromToDate = useMemo(() => {
        return {
            fYear: Number(searchParams.get('fYear')),
            fMonth: Number(searchParams.get('fMonth')),
            fDay: Number(searchParams.get('fDay')),
            tYear: Number(searchParams.get('tYear')),
            tMonth: Number(searchParams.get('tMonth')),
            tDay: Number(searchParams.get('tDay')),
        };
    }, [searchParams]);


    const isMounted = useRef(true);

    const [user, setUser] = useState<User>();
    const [submissions, setSubmissions] = useState<HandleContestProtocol[]>([]);
    const [contest, setContest] = useState<Contest>();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const args = new GetHandleContestProtocolArgs(
            handle, contestId, 
            fromToDate.fYear, fromToDate.fMonth, fromToDate.fDay, 
            fromToDate.tYear, fromToDate.tMonth, fromToDate.tDay
        );

        try {
            const response = await getHandleContestProtocol(args);
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
    }, [t, handle, contestId, fromToDate]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userResponse = await getUser(handle);
                if (!userResponse.ok) throw new Error(t('common:error', { statusCode: userResponse.status }));
                const user: User = await userResponse.json();
                setUser(user);
            } catch (err) {
                setError(err as Error);
            }
        };

        const fetchContest = async () => {
            try {
                const contestResponse = await getContest(contestId, "ru");
                if (!contestResponse.ok) throw new Error(t('common:error', { statusCode: contestResponse.status }));
                const contest: Contest = await contestResponse.json();
                setContest(contest);
            } catch (err) {
                setError(err as Error);
            }
        };
        
        fetchUser();
        fetchContest();
    }, [t]);

    useEffect(() => {
        isMounted.current = true;
        fetchData();
        return () => { isMounted.current = false; };
    }, [fetchData]);

    const columns: Column<HandleContestProtocolForTable>[] = useMemo(() => [
        { key: 'index', header: t('protocol:tableHeaders.index'), accessor: 'index' },
        { key: 'participantType', header: t('protocol:tableHeaders.participantType'), accessor: 'participantType' },
        { key: 'programmingLanguage', header: t('protocol:tableHeaders.programmingLanguage'), accessor: 'programmingLanguage' },
        { key: 'verdict', header: t('protocol:tableHeaders.verdict'), accessor: 'verdict' },
    ], [t]);

    const tableData: HandleContestProtocolForTable[] = submissions.map((sub, index) => ({ ...sub, id: `${sub.index}-${index}` }));

    return (
        <>
            <h1 className='text-3xl w-full text-center font-bold mb-5'>{`${t('protocol:protocolTableTitle')}: ${user?.lastName} ${user?.firstName} - #${contestId}`}</h1>

            <Table
                columns={columns}
                data={tableData}
                isLoading={isLoading}
                error={error}
                onRowClick={(sub) => {
                    if (!contest?.gym) {
                        window.open(`https://codeforces.com/problemset/problem/${contestId}/${sub.index}`);
                    } else {
                        window.open(`https://codeforces.com/gym/${contestId}/problem/${sub.index}`)
                    }
                }}
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