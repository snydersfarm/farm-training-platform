import { signOut } from "next-auth/react";
import { User } from "@prisma/client";

interface DashboardNavProps {
  user: User;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="text-lg font-semibold">
        Welcome, {user.name || user.email}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
      >
        Sign Out
      </button>
    </nav>
  );
} 