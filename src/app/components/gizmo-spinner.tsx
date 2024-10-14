'use client'
import { useEffect, useState } from 'react'
import Styles from './gizmo-spinner.module.css'

export default function GizmoSpinner()
{   
    const [loadingMsg, setLoadingMsg] = useState(<>Loading...</>);
    const timeout = setTimeout(() => {setLoadingMsg(<>Loading takes too long!<br/>Check your connection.</>);}, 15000);
    
    useEffect(() => {
        return () => {clearTimeout(timeout)};
    }, []);

    return(
        <>
            <div className={Styles.pad}>
                <div className={`${Styles.loader_generic} ${Styles.loader_more}`}></div>
                <div className={`${Styles.loader_generic} ${Styles.loader}`}></div>
                <p className={Styles.pad_text}>{loadingMsg}</p>
            </div>
        </>
    )
}