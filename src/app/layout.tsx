import "./index.css";

import type { Metadata } from "next";
import { FC, ReactNode } from "react";
import { SessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "English Learning",
  description: "English Learning App",
};

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
