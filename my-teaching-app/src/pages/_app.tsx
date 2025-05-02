import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import "../styles/globals.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (!sessionStorage.getItem("sessionId")) {
                sessionStorage.setItem("sessionId", Date.now().toString());

                const currentUser = localStorage.getItem("currentUser");
                if (currentUser && router.pathname !== "/") {
                    router.push("/");
                }
            }
        }
    }, [router]);

    // Initialize dark mode from localStorage on initial load
    useEffect(() => {
        // Check for theme preference in localStorage or system
        if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    return (
        <>
            <Head>
                <title>duTeach - Find Expert Tutors</title>
                <meta name="description" content="Connect with top-rated tutors for courses at the School of Computer Science" />
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
