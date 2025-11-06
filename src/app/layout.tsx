import { Analytics } from "@vercel/analytics/next";
import "./index.css";

import type { Metadata } from "next";
import { FC, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { UserMenu } from "@/components/auth";

export const metadata: Metadata = {
  title: "English Learning",
  description: "English Learning App",
};

const RootLayout: FC<{ children: ReactNode }> = async ({ children }) => {
  const session = await auth();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <SessionProvider session={session}>
          {session?.user && (
            <header className="border-b">
              <div className="container mx-auto flex items-center justify-between p-4">
                <h1 className="text-xl font-bold">Learning English</h1>
                <UserMenu user={session.user} />
              </div>
            </header>
          )}
          <main className="flex flex-1 flex-col items-center justify-center">
            {children}
          </main>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
