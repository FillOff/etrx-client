import HomeTable from "./homeTable";

export default function Home() {

    return (
        <>
            <h1 className="w-full text-center font-bold text-3xl">Последние 10 контестов</h1>
            <HomeTable />
        </>
    );
}
