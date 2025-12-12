import type { Metadata } from "next";
import "@/app/globals.css";
import { Providers } from "@/provider/Providers";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";

export const metadata: Metadata = {
    title: "FLOCUT",
    description: "문서·음성 기반 AI 요약 플랫폼",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" suppressHydrationWarning>
        <body>
        <Providers>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
        </Providers>
        </body>
        </html>
    );
}
