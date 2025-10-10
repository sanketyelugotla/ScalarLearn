"use client";

import { Toaster } from "sonner";
import { useUser } from "@/context/userContext";
import { useEffect, useState } from "react";

export default function ToastWithTheme() {
  const { dark } = useUser();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <style jsx global>{`
        [data-sonner-toast] {
          animation: slideInLeft 0.35s ease forwards;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      <div className="fixed top-4 right-4 z-[9999]">
        <Toaster
          theme={dark ? "dark" : "light"}
          position="top-left"
          toastOptions={{
            style: {
              background: dark ? "#020817" : "#ffffff",
              color: dark ? "#ffffff" : "#000000",
              border: dark ? "1px solid #1e293b" : "1px solid #e2e8f0",
              maxWidth: isMobile ? "75vw" : "320px",
              fontSize: isMobile ? "12.5px" : "14px",
              padding: isMobile ? "6px 10px" : "12px 16px"
            }
          }}
        />
      </div>
    </>
  );
}
