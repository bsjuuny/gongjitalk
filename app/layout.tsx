import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "공지톡 정리함 — 어린이집·유치원 공지 분석기",
  description: "어린이집, 유치원 공지문을 붙여넣으면 부모가 해야 할 일을 바로 정리해 드려요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-[#fafaf8]">{children}</body>
    </html>
  );
}
