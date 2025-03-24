'use client';

import { useTranslation } from 'react-i18next';
import '../../i18n/client';
import { useState, useEffect } from 'react';
import GizmoSpinner from '../components/gizmo-spinner';
import Styles from "../components/network-table.module.css";

interface UpdateDetail {
    type: string;
    details: string[];
}

interface Update {
    date: string;
    items: UpdateDetail[];
}

export default function Page() {
    const { t, i18n } = useTranslation();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <GizmoSpinner />;
    }

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-center mb-5">{t('about:updatesTitle')}</h1>
            <div className={Styles.container}>
                <table className={Styles.table}>
                    <thead>
                        <tr>
                            <th className={Styles.th}>{t('about:version')}</th>
                            <th className={Styles.th}>{t('about:changes')}</th>    
                        </tr>
                    </thead>
                    <tbody>
                        {(t('about:updates', { returnObjects: true }) as any[]).map((update, index) => (
                            <tr key={index}>
                                <td className={Styles.cell}>
                                    <div className="text-center">{update.date}</div>
                                </td>
                                <td className={Styles.cell}>
                                    <div className="ml-8">
                                        <ul className="w-[80%] list-disc">
                                            {update.items.map((item: any, itemIndex: number) => (
                                                <li key={itemIndex}>
                                                    {item.type}
                                                    <div className="ml-6">
                                                        <ul className="list-circle">
                                                            {item.details.map((detail: string, detailIndex: number) => (
                                                                <li key={detailIndex}>{detail}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
