'use client';
import { Entry, RequestProps, Table, TableEntry, TableProps } from "@/app/components/table";
import { getContest, getContestSubmissions, GetContestSubmissionsArgs, getContestSubmissionsWithUpdate, updateContestSubmissions } from "@/app/services/contests";
import { useParams } from "next/navigation";
import TableStyles from '../../components/network-table.module.css';
import { useEffect, useMemo, useRef, useState } from "react";
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { RadioGroup, Option } from "../../components/contest-radiogroup";
import Contest from "@/app/models/ContestData";
import { useTranslation } from 'react-i18next';
import '../../../i18n/client';

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
    t('contestId:tableHeaders.firstName'),
    t('contestId:tableHeaders.lastName'),
    t('contestId:tableHeaders.city'),
    t('contestId:tableHeaders.organization'),
    t('contestId:tableHeaders.class'),
    t('contestId:tableHeaders.solvedCount')
  ]);

  async function getData(props: RequestProps) {
    let response: Response;
    try {
      response = await getContest(contestId);
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
    const args = new GetContestSubmissionsArgs(
      contestId,
      props.sortField,
      props.sortOrder,
      participantType
    );

    try {
      if (firstUpdate.current) {
        await updateContestSubmissions(contestId);
        response = await getContestSubmissionsWithUpdate(args);
        firstUpdate.current = false;
      } else {
        response = await getContestSubmissions(args);
      }
    } catch (error) {
      setStatusCode(-1);
      return { entries: [], props: props };
    }

    data = await response.json();
    const rawEntries = Array.from(data['submissions']);

    setStatusCode(response.status);

    if (rawEntries[0])
      props.fieldKeys = Object.keys(rawEntries[0])
        .filter(key => key != 'handle' && key != 'participantType');

    const newIndexes: string[] = [];
    data['problemIndexes'].forEach((elem: string) => {
      newIndexes.push(elem);
    });
    tableProps.columnNames = [
      t('contestId:tableHeaders.firstName'),
      t('contestId:tableHeaders.lastName'),
      t('contestId:tableHeaders.city'),
      t('contestId:tableHeaders.organization'),
      t('contestId:tableHeaders.class'),
      t('contestId:tableHeaders.solvedCount')
    ].concat(newIndexes);

    const entries: TableEntry[] = [];
    rawEntries.forEach((raw: any, i) => {
      const len = Object.keys(raw).length;
      const entry: Entry = new Entry();

      entry.cells = Array(len);
      const rawKeys = Object.keys(raw)
        .filter(key => (key != 'handle') && (key != 'participantType'));

      rawKeys.forEach((key, i) => {
        if (key == 'tries') {
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