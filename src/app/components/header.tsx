'use client'

import { useEffect, useState } from "react";
import DdStyles from "./dropdown.module.css"
import MiscStyles from "./misc.module.css"
import { useRouter } from "next/navigation"
import Dropdown from "./dropdown";
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/client';

export default function Header()
{
    const [mounted, setMounted] = useState(false);
    const [key, setKey] = useState(0);
    const router = useRouter();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ru' ? 'en' : 'ru';
        changeLanguage(newLang);
        document.documentElement.lang = newLang;
        setKey(prev => prev + 1);
    };

    if (!mounted) {
        return null;
    }

    return(
        <>
            <div key={key} className="flex items-center fixed w-full h-16 bg-main">
                <div className="flex items-center w-fit">
                    <h1 className={DdStyles.header_elem_static + ' select-none bg-main-light font-bold italic text-[28px]'}>
                        ETRX
                    </h1>
                    <button onClick={() => router.push('/')} className={DdStyles.header_elem}>
                        {t('header:main')}
                    </button>
                    <Dropdown header={t('header:contests')} onClick={() => router.push('/contest')}>
                        <button onClick={() => router.push('/contest')} className={DdStyles.dropdown_elem}>{t('header:view_all_contests')}</button>
                        <button className={DdStyles.dropdown_elem}><div className={MiscStyles.add_ico}></div> {t('header:add_new')}</button>
                    </Dropdown>
                    <Dropdown header={t('header:users')} onClick={() => router.push('/user')}>
                        <button onClick={() => router.push('/user')} className={DdStyles.dropdown_elem}>{t('header:view_all_users')}</button>
                        <button className={DdStyles.dropdown_elem}><div className={MiscStyles.add_ico}></div> {t('header:add_new')}</button>
                    </Dropdown>
                    <button onClick={() => router.push('/problem')} className={DdStyles.header_elem}>{t('header:problems')}</button>
                    <button onClick={() => router.push('/protocol')} className={DdStyles.header_elem}>{t('header:protocol')}</button>
                    <button onClick={() => router.push('/about')} className={DdStyles.header_elem}>{t('header:about')}</button>
                </div>
                <div className="flex items-center gap-4 ml-auto mr-2">
                    <button 
                        onClick={toggleLanguage}
                        className="px-3 py-1 text-sm text-white bg-main-light rounded hover:bg-main-dark transition-colors"
                    >
                        {i18n.language === 'ru' ? 'EN' : 'RU'}
                    </button>
                    <div className="flex flex-col items-left text-xs text-white">
                        <div>Version: {process.env.NEXT_PUBLIC_VERSION}</div>
                        <div>Build: {process.env.NODE_ENV}</div>
                    </div>
                </div>
            </div>
            {/* acts as bottom margin */}
            <div className="w-full h-20"></div>
        </>
    )
}