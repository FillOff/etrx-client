'use client';
import { useRouter } from "next/navigation"
import Styles from './sidebar.module.css' 
import MiscStyles from './misc.module.css'
import { useEffect, useState } from "react";

type SidebarProps = {
    sidebarId: string,
}

const btnIdPostfix = '--open-btn'

export function Sidebar ({sidebarId}: SidebarProps)
{
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const outOfSidebarPad = <button className={Styles.out_of_sidebar} onClick={() => {setOpen(!open); toggle(sidebarId)}}/>;
    const [matches, setMatches] = useState(false);

    function toggle(sidebarId: string)
    {
        const sidebar = document.getElementById(sidebarId);
        const button = document.getElementById(sidebarId + btnIdPostfix);
        
        if(!sidebar || !button)
            return;

        if(getComputedStyle(sidebar).display == 'none')
        {
            sidebar.classList.remove(`${Styles.hide}`);
            sidebar.classList.add(`${Styles.show}`);
        }
        else
        {
            sidebar.classList.remove(`${Styles.show}`);
            sidebar.classList.add(`${Styles.hide}`);
        }
        
        button.style.display = getComputedStyle(button).display == 'none'? 
            'block' :
            'none';

        setOpen(!open);
    }

    useEffect(() => {
        if(!window)
            return;
        window.matchMedia("(min-width: 800px)").addEventListener('change', e => setMatches(e.matches));
        return () => document.removeEventListener('change', e => setMatches(false));
    }, []);

    useEffect(() => {
        if(open)
        {
            toggle(sidebarId);
        }
    }, [matches]);
    
    return (
        <>
            <button id={sidebarId + btnIdPostfix} onClick={() => {toggle(sidebarId)}} className={Styles.button}></button>
            <div className={`${Styles.sidebar}`} id={sidebarId}>
                <div className={Styles.scrollable}>
                    <div className={Styles.head}>
                        ETRX 
                    </div>
                    <button onClick={() => {toggle(sidebarId); router.push('/')}} className={Styles.category}>Главная</button>
                    <div className={Styles.category}>Контесты</div>
                    <button onClick={() => {toggle(sidebarId); router.push('/contests/view')}} className={Styles.option}>Просмотреть все</button>
                    <button onClick={() => {toggle(sidebarId); router.push('/contests/add')}} className={Styles.option}>
                        <span style={{width: 'min(3vw, 3vh)', height: 'min(3vw, 3vh)', fontSize: 'min(4vw, 4vh)'}} 
                            className={`${MiscStyles.add_ico} flex items-center justify-center`}>
                        </span>
                        Добавить
                    </button>
                </div>
                <button onClick={() => {toggle(sidebarId)}} className={`${Styles.integrated_button_cont} ${Styles.category} justify-start absolute bottom-5`}>
                    <div className={Styles.integrated_button}></div>
                    <div>Выход</div>
                </button>
            </div>
            {open? outOfSidebarPad : <></>}
        </>
    )
}