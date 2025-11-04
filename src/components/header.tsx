"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui";

export const Header = () => {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <header className="w-full bg-white border-b shadow-sm mb-6">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {session.user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="text-sm">
            <p className="font-medium">{session.user.name}</p>
            <p className="text-gray-500">{session.user.email}</p>
          </div>
        </div>
        <Button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          variant="outline"
          size="sm"
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
};
