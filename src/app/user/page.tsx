"use client";
import { getUsers, GetUsersArgs } from "@/app/services/users";
import { Entry, RequestProps, Table, TableEntry, TableProps } from "@/app/components/table";
import { useMemo, useState, useEffect } from "react";
import TableStyles from '@/app/components/network-table.module.css';
import GizmoSpinner from "@/app/components/gizmo-spinner";
import { useTranslation } from 'react-i18next';
import '../../i18n/client';

export default function Page() {
  const { t, i18n } = useTranslation();
  const [statusCode, setStatusCode] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  async function getData(props: RequestProps) {
    // Prepare request parameters
    props.sortField = props.sortField ? props.sortField : 'firstName';
    props.sortOrder = props.sortOrder != null ? props.sortOrder : true;
    const args = new GetUsersArgs(
      null,
      null,
      props.sortField,
      props.sortOrder
    );

    // Get raw data
    let response: Response;
    try {
      response = await getUsers(args);
    } catch (error) {
      setStatusCode(-1);
      return { entries: [], props: props };
    }

    const data = await response.json();
    const rawEntries = Array.from(data.users);

    // Set status code to track request state
    setStatusCode(response.status);

    // Set field keys that we got
    if (rawEntries[0])
      props.fieldKeys = Object.keys(rawEntries[0]);

    // Create viewable content from raw data
    const entries: TableEntry[] = [];
    rawEntries.forEach((raw: any, i) => {
      const len = Object.keys(raw).length;
      const entry: Entry = new Entry();

      entry.cells = Array(len);
      Object.keys(raw).forEach((key, i) => {
        entry.cells.push(<td key={i} className={TableStyles.cell}>{raw[key]}</td>);
      });

      const tEntry = new TableEntry;
      tEntry.row = <tr key={i} className={TableStyles.tr_link}
        onClick={() => window.open(`https://codeforces.com/profile/${raw['handle']}`)}>
        {entry.cells}
      </tr>;
      entries.push(tEntry);
    });

    return { entries: entries, props: props };
  }

  const tableProps = new TableProps([
    t('user:tableHeaders.id'),
    t('user:tableHeaders.handle'),
    t('user:tableHeaders.firstName'),
    t('user:tableHeaders.lastName'),
    t('user:tableHeaders.organization'),
    t('user:tableHeaders.city'),
    t('user:tableHeaders.class')
  ]);

  const table = useMemo(() => {
    if (!isClient) return null;
    
    return (
      <>
        <div>
          <Table getData={getData} props={tableProps}></Table>
        </div>
      </>
    );
  }, [i18n.language, isClient]);

  if (!isClient) {
    return <GizmoSpinner />;
  }

  return (
    <>
      <h1 className='text-3xl w-full text-center font-bold mb-5'>{t('user:usersTableTitle')}</h1>
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