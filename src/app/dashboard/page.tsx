import DashboardNavbar from "@/components/dashboard-navbar";
import { InfoIcon } from "lucide-react";
import ServerDashboard from "./ServerDashboard";
import { getUserData } from "./getUserData";
import ClientDashboard from "./ClientDashboard";

export default async function Dashboard() {
  const user = await getUserData();

  return (
    <>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center">
              <InfoIcon size="14" />
              <span>
                This is a protected page only visible to authenticated users
              </span>
            </div>
          </header>

          {/* User Profile Section */}
          <ServerDashboard user={user} />

          {/* Voice-to-SQL Query Section */}
          <ClientDashboard />
        </div>
      </main>
    </>
  );
}
