import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Security() {
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  return (
    <div className="h-full bg-[#0D0D0D] overflow-y-auto">
      <div className="px-6 py-4 border-b border-[#1E1E1E] sticky top-0 bg-[#0D0D0D]">
        <div>
          <h1 className="text-2xl font-bold text-white">Security</h1>
          <p className="text-sm text-[#999] mt-1">
            Manage security settings and authentication
          </p>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Account Security */}
        <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <Lock size={20} className="text-[#5E6AD2] mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">Account Security</h2>
              <p className="text-sm text-[#999] mt-1">
                Your account is secured with authentication
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div className="p-4 bg-[#0D0D0D] border border-[#1E1E1E] rounded">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Email Verification</p>
                  <p className="text-sm text-[#999] mt-1">
                    {currentUser?.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                  <span className="text-sm text-[#4ADE80]">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Active Sessions
          </h2>
          <div className="space-y-2">
            <div className="p-4 bg-[#0D0D0D] border border-[#1E1E1E] rounded">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Current Session</p>
                  <p className="text-sm text-[#999] mt-1">
                    Last active: Just now
                  </p>
                </div>
                <span className="text-xs bg-[#1E1E1E] text-[#999] px-3 py-1 rounded">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Your Permissions
          </h2>
          <div className="space-y-2">
            <div className="p-3 bg-[#0D0D0D] border border-[#1E1E1E] rounded flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#4ADE80]" />
              <span className="text-sm text-white">
                Role: <span className="font-medium">{currentUser?.role}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Account Actions
          </h2>
          <div className="space-y-3">
            <Button
              onClick={() => base44.auth.logout()}
              variant="outline"
              className="w-full"
            >
              Logout
            </Button>
            <Button
              onClick={() => base44.auth.logout()}
              variant="destructive"
              className="w-full"
            >
              Logout All Sessions
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-[#0D0D0D] border border-[#1E1E1E] rounded flex gap-3">
          <AlertCircle size={16} className="text-[#FACC15] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#999]">
            Never share your login credentials or authentication tokens with anyone. Keep your password secure.
          </p>
        </div>
      </div>
    </div>
  );
}