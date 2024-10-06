'use client'

import Styles from "./dropdown.module.css"
import MiscStyles from "./misc.module.css"
import { useRouter } from "next/navigation"
import Image from "next/image";
import logo from '../../public/logo.png'
import Dropdown from "./dropdown";

export default function Header()
{
    const router = useRouter()
    
    return(
        <>
            <div className="flex items-center fixed w-full h-16 bg-main">
                {/* <img src="../../../assets/img/logo.png" className="w-14 h-14"/> */}
                <Image src={logo} alt="Logo" className="m-2" width={40} height={40} priority/>
                <button onClick={() => router.push('/')} className={Styles.header_elem}>
                    Главная
                </button>
                <Dropdown header="Контесты">
                    <button onClick={() => router.push('/contests')} className={Styles.dropdown_elem}>Просмотреть все</button>
                    <button className={Styles.dropdown_elem}><div className={MiscStyles.add_ico}></div> Добавить</button>
                </Dropdown>
            </div>
            {/* acts as bottom margin */}
            <div className="w-full h-20"></div>
        </>
    )
}