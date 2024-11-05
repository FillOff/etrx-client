export default function Home() {
  return (
    <>
        <h1 className="w-vlw text-center font-bold text-3xl">ETRX</h1>
        <div className="flex flex-col items-center">
            <p>Last update: {process.env.LAST_UPDATE}</p>
            <p>Version: v{process.env.VERSION}</p>
            <p>Build: {process.env.NODE_ENV}</p>
        </div>
    </>
  );
}
