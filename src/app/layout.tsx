import type { Metadata } from "next";
import { Anton, Oleo_Script } from "next/font/google";
import { ClickToComponentDev } from "@/components/common/ClickToComponentDev";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const oleoScript = Oleo_Script({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-oleo-script",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio",
 icons: {
    icon: "/icon.svg", // 👈 'public/'을 빼고 이렇게 슬래시(/)로 시작해야 합니다!
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${anton.variable} ${oleoScript.variable}`}>
      <body>
        {children}
        <ClickToComponentDev />
      </body>
    </html>
  );
}
