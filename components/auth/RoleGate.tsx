"use client";

import React from "react";
import { useUserRole, type UserRole } from "@/hooks/useUserRole";
import { ShieldAlert } from "lucide-react";

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({
  allowedRoles,
  children,
  fallback,
}: RoleGateProps) {
  const role = useUserRole();

  if (role === null) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  if (!allowedRoles.includes(role)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
            <ShieldAlert className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              Your role ({role}) does not have permission to access this page.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              If you believe this is an error, please contact your administrator.
            </p>
            <a
              href="/dashboard"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
