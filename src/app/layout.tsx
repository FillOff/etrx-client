import { useId } from "react";
import Header from "./components/header";
import { Sidebar } from "./components/sidebar";
import "./globals.css";

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  const sidebarId = useId();
  
  return (
    <html lang="en">
      <title>ETRX</title>
      <body>
        <Sidebar sidebarId={sidebarId}/>
        <Header/>
        {children}
      </body>
    </html>
  );
}
