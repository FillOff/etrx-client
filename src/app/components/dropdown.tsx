import { useEffect, useRef } from 'react'
import Styles from './dropdown.module.css'

type Props = {
    header: React.ReactNode
    children: React.ReactNode
}

export default function Dropdown(props: Props)
{
    const headRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if(headRef.current && contentRef.current)
        {
            contentRef.current.style.display = 'block';
            headRef.current.style.width = getComputedStyle(contentRef.current).width;
            contentRef.current.style.display = '';
        }
    }, [headRef, contentRef]);

    return(
        <div ref={headRef} className={`${Styles.dropdown} ${Styles.header_elem}`}>
            {props.header}
            <div ref={contentRef} className={`${Styles.dropdown_menu} ${Styles.dropdown_menu_anim} ${Styles.dropdown_menu_1}`}>
                {props.children}
            </div>
        </div>
    )
}