import { useId } from "react";
import Header from "./components/header";
import { Sidebar } from "./components/sidebar";
import LanguageProvider from "./components/language-provider";
import "./globals.css";

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
    const sidebarId = useId();
    
    return (
        <html>
            <title>ETRX</title>
            <body>
                <LanguageProvider />
                <Sidebar sidebarId={sidebarId}/>
                <Header/>
                {children}
            </body>
        </html>
    );
}
