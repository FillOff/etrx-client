'use client'

import { useCallback, useEffect, useState } from "react";
import DdStyles from "./dropdown.module.css"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/client';

export default function Header()
{
    const [mounted, setMounted] = useState(false);
    const [key, setKey] = useState(0);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams(); 
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

    const handleNavigation = useCallback((targetPath: string) => {
        if (pathname === targetPath) {
            const currentParams = searchParams.toString();
            router.push(`${targetPath}?${currentParams}`);
        } else {
            router.push(targetPath);
        }
    }, [pathname, router, searchParams]); 

    if (!mounted) {
        return null;
    }

    return(
        <>
            <div key={key} className="flex items-center fixed w-full h-16 bg-main">
                {/* Left Side: Navigation Buttons */}
                <div className="flex items-center w-fit">
                    {/* Logo */}
                    <h1 className={`${DdStyles.header_elem_static} select-none bg-main-light font-bold italic text-[28px]`}>
                        ETRX
                    </h1>

                    <button onClick={() => handleNavigation('/')} className={DdStyles.header_elem}>
                        {t('header:main')}
                    </button>

                    <button onClick={() => handleNavigation('/contest')} className={DdStyles.header_elem}>
                        {t('header:contests')}
                    </button>

                    <button onClick={() => handleNavigation('/user')} className={DdStyles.header_elem}>
                        {t('header:users')}
                    </button>
                    
                    {/* <Dropdown header={t('header:users')} onClick={() => pushRouteWithQueryParams('/user', pathname, router)}>
                        <button onClick={() => pushRouteWithQueryParams('/user', pathname, router)} className={DdStyles.dropdown_elem}>
                            {t('header:view_all_users')}
                        </button>
                        <button className={DdStyles.dropdown_elem}>
                            <div className={MiscStyles.add_ico}></div> {t('header:add_new')}
                        </button>
                    </Dropdown> */}

                    <button onClick={() => handleNavigation('/problem')} className={DdStyles.header_elem}>
                        {t('header:problems')}
                    </button>

                    <button onClick={() => handleNavigation('/protocol')} className={DdStyles.header_elem}>
                        {t('header:protocol')}
                    </button>

                    <button onClick={() => handleNavigation('/about')} className={DdStyles.header_elem}>
                        {t('header:about')}
                    </button>
                </div>

                {/* Right Side: Language Toggle and Version Info */}
                <div className="flex items-center gap-4 ml-auto mr-2">
                    {/* Language Toggle Button */}
                    <button
                        onClick={toggleLanguage}
                        className="px-3 py-1 text-sm text-white bg-main-light rounded hover:bg-main-dark transition-colors"
                    >
                        {i18n.language === 'ru' ? 'EN' : 'RU'}
                    </button>

                    {/* Version and Build Info */}
                    <div className="flex flex-col items-left text-xs text-white">
                        <div>Version: {process.env.NEXT_PUBLIC_VERSION}</div>
                    </div>
                </div>
            </div>

            <div className="w-full h-20"></div>
        </>
    )
}