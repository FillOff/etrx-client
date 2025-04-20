"use client";

import { useEffect, useMemo, useState } from "react";
import { GetContestsArgs, getContests } from "../services/contests";
import TableStyles from '../components/network-table.module.css';
import { Entry, TableEntry, Table, TableProps, RequestProps } from "@/app/components/table";
import { RadioGroup, Option } from "../components/contest-radiogroup";
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { useTranslation } from 'react-i18next';
import '../../i18n/client';

export default function Page() {
  const { t, i18n } = useTranslation();
  const [statusCode, setStatusCode] = useState(0);
  const [gym, setGym] = useState<number>(2);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  async function getData(props: RequestProps) {
    // Prepare request parameters and other properties
    props.page = props.page ? props.page : 1;
    props.sortField = props.sortField ? props.sortField : 'startTime';
    props.sortOrder = props.sortOrder != null ? props.sortOrder : false;
    const args = new GetContestsArgs(
      props.page,
      100,
      props.sortField,
      props.sortOrder,
      gym == 2 ? null : gym == 1 ? true : false,
      i18n.language
    );

    // Get raw data
    let response: Response;
    try {
      response = await getContests(args);
    } catch (error) {
      setStatusCode(-1);
      return { entries: [], props: props };
    }

    const data = await response.json();
    const rawEntries = Array.from(data.contests);

    // Set status code to track request state
    setStatusCode(response.status);

    // Set new page that we got from response
    if (data['pageCount'] && typeof (data['pageCount']) == 'number')
      props.maxPage = data['pageCount'];

    // Set field keys that we got
    if (rawEntries[0])
      props.fieldKeys = Object.keys(rawEntries[0]).filter(k => k != "durationSeconds");

    // Create viewable content from raw data
    const entries: TableEntry[] = [];
    rawEntries.forEach((raw: any, i) => {
      const len = Object.keys(raw).length;
      const entry: Entry = new Entry();

      entry.cells = Array(len);
      Object.keys(raw).forEach((key, i) => {
        if (key == 'startTime' && raw[key] != 0) {
          raw[key] = unixToFormattedDate(raw[key]);
        }

        if (key != "relativeTimeSeconds" && key != "durationSeconds") {
          entry.cells.push(<td key={i} className={TableStyles.cell}>{raw[key]}</td>);
        }
      });

      const tEntry = new TableEntry;
      tEntry.row = <tr key={i} className={TableStyles.tr_link}
        onClick={() => window.open(`/etrx2/contest/${raw['contestId']}`)}>
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

    return `${month} ${day} ${year}`;
  }

  const tableProps = new TableProps([
    t('contest:tableHeaders.id'), 
    t('contest:tableHeaders.name'), 
    t('contest:tableHeaders.startTime')]
);

  const table = useMemo(() => {
    if (!isClient) return null;

    return (
      <>
        <div>
          <Table getData={getData} props={tableProps}></Table>
        </div>
      </>
    );
  }, [gym, i18n.language, isClient]);

  const radioGroupOptions: Option[] = [
    { label: t('contest:filters.all'), value: 2 },
    { label: t('contest:filters.gymOnly'), value: 1 },
    { label: t('contest:filters.contestsOnly'), value: 0 },
  ];

  if (!isClient) {
    return <GizmoSpinner />;
  }

  return (
    <>
      <h1 className='text-3xl w-full text-center font-bold mb-5'>{t('contest:contestsTableTitle')}</h1>
      <RadioGroup
        title={t('contest:filtersTitle')}
        options={radioGroupOptions}
        name="gymFilter"
        value={gym}
        onChange={setGym}
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