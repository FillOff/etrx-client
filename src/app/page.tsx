import HomeTable from "./homeTable";

export default function Home() {

    return (
        <>
            <h1 className="w-vlw text-center font-bold text-3xl">ETRX</h1>
            <div className="flex flex-col items-center">
                <div>Last update: {process.env.LAST_UPDATE}</div>
                <div>Version: v{process.env.VERSION}</div>
                <div>Build: {process.env.NODE_ENV}</div>
            </div>
            <h1 className="w-full text-center font-bold text-3xl mt-10">Последние 10 контестов</h1>
            <HomeTable/>
        </>
    );
}
