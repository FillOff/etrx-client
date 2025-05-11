'use client';
import { useState } from "react";
import { Entry, RequestProps, Table, TableEntry, TableProps } from "./components/table";
import { getContests, GetContestsArgs } from "./services/contests";
import TableStyles from './components/network-table.module.css';
import GizmoSpinner from "./components/gizmo-spinner";
import { useTranslation } from 'next-i18next';

export default function HomeTable() {
  const { t, i18n } = useTranslation('home');
  const [statusCode, setStatusCode] = useState(0);

  async function getData(props: RequestProps) {
    // Prepare request parameters and other properties
    props.page = props.page ? props.page : 1;
    props.sortField = props.sortField ? props.sortField : 'startTime';
    props.sortOrder = props.sortOrder ? props.sortOrder : false;
    const args = new GetContestsArgs(
      props.page,
      10,
      props.sortField,
      props.sortOrder,
      null,
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
      props.fieldKeys = Object.keys(rawEntries[0]).filter(k => k != "durationSeconds" && k != "isContestLoaded");

    // Create viewable content from raw data
    const entries: TableEntry[] = [];
    rawEntries.forEach((raw: any, i) => {
      const len = Object.keys(raw).length;
      const entry: Entry = new Entry();

      entry.cells = Array(len);
      Object.keys(raw).forEach((key, i) => {
        if (key == "startTime" && raw[key] != 0) {
          raw[key] = unixToFormattedDate(raw[key]);
        }

        if (key != "relativeTimeSeconds" && key != "durationSeconds" && key != "isContestLoaded") {
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

  function contestTable() {
    const tableProps = new TableProps(
      [t('home:tableHeaders.id'), t('home:tableHeaders.name'), t('home:tableHeaders.startTime')]
    );
    tableProps.hidePageSelectors = true;

    // Display table and hide it if status code is not 200
    return (
      <>
        {statusCode == 0 && <div className='mb-[150px]'><GizmoSpinner></GizmoSpinner></div>}
        {statusCode != 200 && statusCode != 0 &&
          <h1 className="w-full text-center text-2xl font-bold">
            {t('common:error', { statusCode })}
          </h1>
        }
        <div className={statusCode == 200 ? 'visible' : 'invisible'}>
          <Table getData={getData} props={tableProps}></Table>
        </div>
      </>
    );
  }

  return (
    <>
      {contestTable()}
    </>
  );
}