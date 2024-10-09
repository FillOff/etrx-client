'use client'

import DdStyles from "./dropdown.module.css"
import MiscStyles from "./misc.module.css"
import { useRouter } from "next/navigation"
import Image from "next/image";
import Dropdown from "./dropdown";

export default function Header()
{
    const router = useRouter()
    
    return(
        <>
            <div className="flex items-center fixed w-full h-16 bg-main">
                {/* <img src="../../../assets/img/logo.png" className="w-14 h-14"/> */}
                <h1 className="select-none pl-2 pr-2 pt-1.5 ml-2 mr-2 italic font-mono font-bold text-3xl bg-main-light rounded-xl">ETRX</h1>
                <button onClick={() => router.push('/')} className={DdStyles.header_elem}>
                    Главная
                </button>
                <Dropdown header="Контесты">
                    <button onClick={() => router.push('/contests/view')} className={DdStyles.dropdown_elem}>Просмотреть все</button>
                    <button className={DdStyles.dropdown_elem}><div className={MiscStyles.add_ico}></div> Добавить</button>
                </Dropdown>
            </div>
            {/* acts as bottom margin */}
            <div className="w-full h-20"></div>
        </>
    )
}