import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import SparklesCursor from "@/components/cursor/SparklesCursor";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "VN Traffic Law AI - Trợ lý Luật Giao thông Việt Nam",
  description:
    "Trợ lý AI giúp bạn tìm hiểu về luật giao thông đường bộ Việt Nam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="vi">
        <body className={inter.className}>
          <AntdRegistry>
            <ThemeProvider>
              <SparklesCursor />
              {children}
            </ThemeProvider>
          </AntdRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
