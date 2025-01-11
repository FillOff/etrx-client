'use client'

import DdStyles from "./dropdown.module.css"
import MiscStyles from "./misc.module.css"
import { useRouter } from "next/navigation"
import Dropdown from "./dropdown";

export default function Header()
{
    const router = useRouter();

    return(
        <>
            <div className="flex items-center fixed w-full h-16 bg-main">
                <div className="flex items-center w-fit">
                    <h1 className={DdStyles.header_elem_static + ' select-none bg-main-light font-bold italic text-[28px]'}>
                        ETRX
                    </h1>
                    <button onClick={() => router.push('/')} className={DdStyles.header_elem}>
                        Главная
                    </button>
                    <Dropdown header="Контесты" onClick={() => router.push('/contests/view')}>
                        <button onClick={() => router.push('/contests/view')} className={DdStyles.dropdown_elem}>Просмотреть все</button>
                        <button className={DdStyles.dropdown_elem}><div className={MiscStyles.add_ico}></div> Добавить</button>
                    </Dropdown>
                    <Dropdown header="Ученики" onClick={() => router.push('/users/view')}>
                        <button onClick={() => router.push('/users/view')} className={DdStyles.dropdown_elem}>Просмотреть всех</button>
                        <button className={DdStyles.dropdown_elem}><div className={MiscStyles.add_ico}></div> Добавить</button>
                    </Dropdown>
                    <button onClick={() => router.push('/problems/view')} className={DdStyles.header_elem}>Задачи</button>
                    <button onClick={() => router.push('/about')} className={DdStyles.header_elem}>О сайте</button>

                </div>
                <div className="flex flex-col items-left w-fit text-xs ml-auto mr-2 text-white">
                    <div>Version: {process.env.NEXT_PUBLIC_VERSION}</div>
                    <div>Build: {process.env.NODE_ENV}</div>
                </div>
            </div>
            {/* acts as bottom margin */}
            <div className="w-full h-20"></div>
        </>
    )
}