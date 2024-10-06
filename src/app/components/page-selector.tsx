import Styles from "./page-selector.module.css"

type Props = {
    page: number,
    maxPage: number,
    pageCallback: (page: number) => void,
}

export default function PageSelector({page, maxPage, pageCallback}: Props)
{
    const maxPageHop = 2; 

    function PrevPageButton()
    {
        if(page === 1)
            return <div className={Styles.button_placeholder}></div>

        return <button onClick={() => pageCallback(page - 1) } className={`${Styles.prev_button} ${Styles.button}`}></button>
    }

    function NextPageButton()
    {
        if(page === maxPage)
            return <div className={Styles.button_placeholder}></div>

        return <button onClick={() => pageCallback(page + 1) } className={`${Styles.next_button} ${Styles.button}`}></button>
    }

    function FirstPageButton()
    {
        if(page === 1)
            return <div className={Styles.button_placeholder}></div>

        return <button onClick={() => pageCallback(1) } className={`${Styles.first_button} ${Styles.button}`}></button>
    }

    function LastPageButton()
    {
        if(page === maxPage)
            return <div className={Styles.button_placeholder}></div>

        return <button onClick={() => pageCallback(maxPage) } className={`${Styles.last_button} ${Styles.button}`}></button>
    }

    function PageButton({page}: {page: number})
    {
        return <button onClick={() => pageCallback(page) } className={`${Styles.button}`}>{page}</button>
    }

    function PageButtons()
    {
        let buttons: (JSX.Element)[] = [];
        for(let it = Math.max(1, page - maxPageHop); it <= Math.min(maxPage, page + maxPageHop); it++)
        {
            buttons.push(<PageButton page={it}/>);
        }
        return buttons;
    }

    return(
        <>
            <div className={Styles.pad}>
                <FirstPageButton/>
                <PrevPageButton/>
                <PageButtons/>
                <NextPageButton/>
                <LastPageButton/>
            </div>
        </>
    );
}