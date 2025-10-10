import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import LayoutWrapper from "./LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Scalar Learn",
  description: "Educational Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-y-auto custom-scroll`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}