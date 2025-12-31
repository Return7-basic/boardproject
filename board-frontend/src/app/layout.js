import { Outfit } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import MainLayout from "@/components/layout/MainLayout";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Q&A Board - 질문과 답변 게시판",
  description: "질문하고 답변하는 커뮤니티 게시판",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={outfit.variable}>
      <body className={outfit.className}>
        <QueryProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
