import "./index.css";

import type { Metadata } from "next";
import { FC, ReactNode } from "react";

export const metadata: Metadata = {
  title: "English Learning",
  description: "English Learning App",
};

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
