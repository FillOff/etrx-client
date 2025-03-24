'use client';

import { useTranslation } from 'react-i18next';
import '../i18n/client';
import { useState, useEffect } from 'react';
import GizmoSpinner from './components/gizmo-spinner';
import HomeTable from './homeTable';

export default function Home() {
    const { t } = useTranslation();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <GizmoSpinner />;
    }

    return (
        <>
            <h1 className="text-3xl w-full text-center font-bold mb-5">{t('home:lastContests')}</h1>
            <HomeTable />
        </>
    );
}
