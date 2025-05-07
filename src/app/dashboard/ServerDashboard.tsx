"use client";

import { UserCircle } from "lucide-react";

interface ServerDashboardProps {
  user: any;
}

export default function ServerDashboard({ user }: ServerDashboardProps) {
  return (
    <div className="bg-card rounded-xl p-6 border shadow-sm mb-8">
      <div className="flex items-center gap-4 mb-6">
        <UserCircle size={48} className="text-primary" />
        <div>
          <h2 className="font-semibold text-xl">User Profile</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="bg-muted/50 rounded-lg p-4 overflow-hidden">
        <pre className="text-xs font-mono max-h-48 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}
