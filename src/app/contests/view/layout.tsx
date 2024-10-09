import Header from "../../components/header"

type Props = {
    children: React.ReactNode
}

export default function Layout({children}: Props)
{
    return(
        <>
            {children}
        </>
    )
}