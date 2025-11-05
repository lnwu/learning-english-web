"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export const UserMenu = ({ user }: UserMenuProps) => {
  const handleSignOut = async () => {
    await signOut({ redirectTo: "/login" });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user.image && (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <div className="text-sm">
          <p className="font-medium">{user.name}</p>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>
      <Button variant="outline" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  );
};
