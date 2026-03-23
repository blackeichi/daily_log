import type { Metadata } from "next";
import { SnackbarProvider } from "./components/providers/SnackbarProvider";
import { PageLayout } from "./components/template/pageLayout";
import "./globals.css";
import { LoadingProgress } from "./components/organisms/loadingProgress";
import { ErrorBoundary } from "./components/organisms/ErrorBoundary";
import { Noto_Sans_KR } from "next/font/google";

export const metadata: Metadata = {
  title: {
    template: "%s - Daily Log",
    default: "Daily Log",
  },
  description: "Daily Log는 당신의 생각을 기록하고 관리하는 앱입니다.",
};

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.className} antialiased`}>
        <ErrorBoundary enableLogging={true}>
          <SnackbarProvider>
            <div className="w-screen h-screen overflow-hidden bg-stone-100 text-stone-800">
              <LoadingProgress />
              <PageLayout>{children}</PageLayout>
            </div>
          </SnackbarProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
