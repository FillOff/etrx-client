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

    // const toggleLanguage = () => {
    //     const newLang = i18n.language === 'ru' ? 'en' : 'ru';
    //     changeLanguage(newLang);
    //     document.documentElement.lang = newLang;
    //     setKey(prev => prev + 1);
    // };

    const SetLangRU = () => {
        changeLanguage('ru');
    }
     const SetLangEN = () => {
        changeLanguage('en');
    }

    const toggleList = () =>{
        var list = document.getElementById('list');
        if(list){
            if (list.style.visibility == 'hidden') list.style.visibility = 'visible';
            else list.style.visibility = 'hidden'
        }
    }

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
                    
                <div 
                className={DdStyles.selectLan}
                onClick={toggleList}
                >
                <p className={DdStyles.cl}>{t('header:cl')}</p>
                <ul
                className={DdStyles.lang_list}
                id="list"
                >
                    <li
                        className={DdStyles.langs}
                        onClick={SetLangRU}
                    >
                        Русский
                    </li>

                    <li
                        className={DdStyles.langs}
                        onClick={SetLangEN}
                    >
                        English
                    </li>
                    
                </ul>
                 </div>

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
