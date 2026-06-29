import type { Metadata } from "next";
import { DashboardNav } from "@/app/(protected)/_components/DashboardNav";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Dashboard",
  },
};

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <DashboardNav />
      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6"
      >
        {children}
      </main>
      <footer className="border-t border-gray-100 bg-white py-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()}{" "}
            {process.env.NEXT_PUBLIC_APP_NAME ?? "AuthApp"}. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
