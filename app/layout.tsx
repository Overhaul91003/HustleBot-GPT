"use client"
import "./global.css";
import { useEffect, useState } from "react";


const RootLayout = ({ children }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <html lang="en">
            <head>
                <title>hustlebot-gpt</title>
                <meta name="description" content="Your ultimate destination for all startup-related queries!" />
            </head>
            <body suppressHydrationWarning>
                {isClient ? children : null}
            </body>
        </html>
    );
};

export default RootLayout;
