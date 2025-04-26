'use client';
import { Entry, RequestProps, Table, TableEntry, TableProps } from "@/app/components/table";
import { getContest } from "@/app/services/contests";
import { useParams } from "next/navigation";
import TableStyles from '../../components/network-table.module.css';
import { useEffect, useMemo, useRef, useState } from "react";
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { RadioGroup, Option } from "../../components/contest-radiogroup";
import Contest from "@/app/models/ContestData";
import { useTranslation } from 'react-i18next';
import '../../../i18n/client';
import { getRanklistRows, GetRanklistRowsArgs, updateRanklistRows } from "@/app/services/ranklistRows";

export default function Page() {
    const { t, i18n } = useTranslation();
    const [participantType, setParticipantType] = useState('CONTESTANT');
    const contestId = Number(useParams().id);
    const [contest, setContest] = useState(new Contest(0, "", 0, 0, 0));
    const timeNow = Math.floor(Date.now() / 1000);
    const [statusCode, setStatusCode] = useState(0);
    const firstUpdate = useRef(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const tableProps = new TableProps([
        t('contestId:tableHeaders.userName'),
        t('contestId:tableHeaders.city'),
        t('contestId:tableHeaders.organization'),
        t('contestId:tableHeaders.class'),
        t('contestId:tableHeaders.points'),
        t('contestId:tableHeaders.solvedCount')
    ]);

    async function getData(props: RequestProps) {
        let response: Response;
        try {
            response = await getContest(contestId, i18n.language);
        } catch (error) {
            setStatusCode(-1);
            return { entries: [], props: props };
        }

        let data = await response.json();
        setContest(data);

        props.page = null;
        props.maxPage = null;
        props.sortField = props.sortField ? props.sortField : 'solvedCount';
        props.sortOrder = props.sortOrder != null ? props.sortOrder : false;
        const args = new GetRanklistRowsArgs(
            contestId,
            props.sortField,
            props.sortOrder,
            participantType,
            i18n.language
        );

        try {
            if (firstUpdate.current) {
                await updateRanklistRows(contestId);
                response = await getRanklistRows(args);
                firstUpdate.current = false;
            } else {
                response = await getRanklistRows(args);
            }
        } catch (error) {
            setStatusCode(-1);
            return { entries: [], props: props };
        }

        data = await response.json();
        const rawEntries = Array.from(data['ranklistRows']);
        const problems = data['problems'];

        setStatusCode(response.status);

        const problemIndexes = problems.map((problem: any) => problem.index);
        let columnNames = [
            t('contestId:tableHeaders.userName'),
            t('contestId:tableHeaders.city'),
            t('contestId:tableHeaders.organization'),
            t('contestId:tableHeaders.class'),
            t('contestId:tableHeaders.points'),
            t('contestId:tableHeaders.solvedCount')
        ];

        if (participantType === "ALL") {
            columnNames.splice(6, 0, t('contestId:tableHeaders.participantType'));
        }

        tableProps.columnNames = columnNames.concat(problems.map((problem: any) => `${problem.index}`));

        const entries: TableEntry[] = [];
        rawEntries.forEach((raw: any, i: number) => {
            const entry: Entry = new Entry();

            const staticCells = [
                <td key={`${raw.handle}-name`} className={TableStyles.cell}>{raw.username}</td>,
                <td key={`${raw.handle}-city`} className={TableStyles.cell}>{raw.city}</td>,
                <td key={`${raw.handle}-org`} className={TableStyles.cell}>{raw.organization}</td>,
                <td key={`${raw.handle}-grade`} className={TableStyles.cell}>{raw.grade}</td>,
                <td key={`${raw.handle}-points`} className={TableStyles.cell}>{raw.points}</td>,
                <td key={`${raw.handle}-solved`} className={TableStyles.cell}>{raw.solvedCount}</td>
            ];

            if (participantType === "ALL") {
                staticCells.splice(6, 0, <td key={`${raw.handle}-type`} className={TableStyles.cell}>{raw.participantType}</td>);
            }

            const dynamicCells = problemIndexes.map((index: string) => {
                const result = raw.problemResults.find((pr: any) => pr.index === index);
                if (result && result.points !== 0) {
                    if (result.points === 1)
                    {
                        return (
                            <td key={`${raw.handle}-${index}`} className={TableStyles.cell}>
                                +
                            </td>
                        );
                    }
                    return (
                        <td key={`${raw.handle}-${index}`} className={TableStyles.cell}>
                            {result.points}
                        </td>
                    );
                } else if (result && result.points === 0) {
                    if (result.rejectedAttemptCount !== 0) {
                        return <td key={`${raw.handle}-${index}`} className={TableStyles.cell}>-{result.rejectedAttemptCount}</td>;
                    }
                    return <td key={`${raw.handle}-${index}`} className={TableStyles.cell}></td>;
                } else {
                    return <td key={`${raw.handle}-${index}`} className={TableStyles.cell}></td>;
                }
            });

            entry.cells = [...staticCells, ...dynamicCells];
            const tEntry = new TableEntry();
            tEntry.row = <tr key={i} className={TableStyles.tr}>{entry.cells}</tr>;
            entries.push(tEntry);
        });

        return { entries: entries, props: props };
    }

    useEffect(() => {
        setStatusCode(0);
    }, [participantType]);

    const table = useMemo(() => {
        if (!isClient) return null;

        return (
            <>
                <div>
                    <Table getData={getData} props={tableProps}></Table>
                </div>
            </>
        );
    }, [participantType, i18n.language, isClient]);

    const participantFilterOptions: Option[] = [
        { label: t('contestId:filters.options.all'), value: 'ALL' },
        { label: t('contestId:filters.options.contestant'), value: 'CONTESTANT' },
        { label: t('contestId:filters.options.practice'), value: 'PRACTICE' },
        { label: t('contestId:filters.options.virtual'), value: 'VIRTUAL' },
        { label: t('contestId:filters.options.outOfCompetition'), value: 'OUT_OF_COMPETITION' },
    ];

    if (!isClient) {
        return <GizmoSpinner />;
    }

    return (
        <>
            <h1 className='text-3xl w-full text-center font-bold mb-5'>
                {t('contestId:contestTitle', { contestName: contest.name, contestId: contest.contestId })}
            </h1>
            <RadioGroup
                title={t('contestId:filters.participation')}
                options={participantFilterOptions}
                name="participantTypeFilter"
                value={participantType}
                onChange={setParticipantType}
            />
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
    );
}