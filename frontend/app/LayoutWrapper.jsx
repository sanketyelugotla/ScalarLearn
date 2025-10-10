"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { UserProvider } from "@/context/userContext";
import ToastWithTheme from "@/components/ToastWithTheme"; // custom toaster wrapper

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const hideNavbar = pathname.startsWith("/auth");

    return (
        <UserProvider>
            <ToastWithTheme /> {/* ✅ toast reacts to theme from useUser() */}
            {/*!hideNavbar && <Navbar />*/}
            <Navbar />
            {children}
            <Footer />
            {/*!hideNavbar && <Footer />*/}
        </UserProvider>
    );
}
