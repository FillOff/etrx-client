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
            return <div className={`${Styles.cont_placeholder} ${Styles.button}`}></div>

        return <button name='Previous page' onClick={() => pageCallback(page - 1) } className={`${Styles.prev_button} ${Styles.button}`}></button>
    }

    function NextPageButton()
    {
        if(page === maxPage)
            return <div className={`${Styles.cont_placeholder} ${Styles.button}`}></div>

        return <button name='Next page' onClick={() => pageCallback(page + 1) } className={`${Styles.next_button} ${Styles.button}`}></button>
    }

    function FirstPageButton()
    {
        if(page === 1)
            return  <div className={`${Styles.cont_placeholder} ${Styles.button}`}></div>

        return <button name='First page' onClick={() => pageCallback(1) } className={`${Styles.first_button} ${Styles.button}`}></button>
    }

    function LastPageButton()
    {
        if(page === maxPage)
            return  <div className={`${Styles.cont_placeholder} ${Styles.button}`}></div>

        return <button name='Last page' onClick={() => pageCallback(maxPage) } className={`${Styles.last_button} ${Styles.button}`}></button>
    }

    function PageButton({page}: {page: number})
    {
        return <button name={`Page ${page}`} key={page} onClick={() => pageCallback(page) } className={`${Styles.button}`}>{page}</button>
    }

    function PageButtons()
    {
        let buttons: (JSX.Element)[] = [];
        // Fill placeholders in front
        for(let it = 1; it <= maxPageHop - page + 1; it++)
        {
            buttons.push(<div key={1 - it} className={`${Styles.placeholder} ${Styles.button}`}></div>);
        }
        // Fill page buttons
        for(let it = Math.max(1, page - maxPageHop); it <= Math.min(maxPage, page + maxPageHop); it++)
        {
            buttons.push(<PageButton key={it} page={it}/>);
        }
        // Fill placeholders in back
        for(let it = 1; it <= maxPageHop - maxPage + page; it++)
        {
            buttons.push(<div key={maxPage + it} className={`${Styles.placeholder} ${Styles.button}`}></div>);
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
            <div className={Styles.silent_pad}>
                <FirstPageButton/>
                <PrevPageButton/>
                <NextPageButton/>
                <LastPageButton/>
            </div>
        </>
    );
}