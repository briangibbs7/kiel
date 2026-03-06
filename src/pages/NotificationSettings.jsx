import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NotificationSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notify_assignments: true,
    notify_status_changes: true,
    notify_comments: true,
    notify_deadlines: true,
    notify_mentions: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setSettings({
          notify_assignments: currentUser?.notify_assignments ?? true,
          notify_status_changes: currentUser?.notify_status_changes ?? true,
          notify_comments: currentUser?.notify_comments ?? true,
          notify_deadlines: currentUser?.notify_deadlines ?? true,
          notify_mentions: currentUser?.notify_mentions ?? true,
        });
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleToggle = async (key) => {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));
    setSaving(true);
    try {
      await base44.auth.updateMe({ [key]: newValue });
    } catch (error) {
      console.error("Failed to save setting:", error);
      setSettings((prev) => ({ ...prev, [key]: !newValue }));
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    {
      key: "notify_assignments",
      label: "Issue Assignments",
      description: "Get notified when you're assigned to an issue",
    },
    {
      key: "notify_status_changes",
      label: "Status Changes",
      description: "Get notified when an assigned issue's status changes",
    },
    {
      key: "notify_comments",
      label: "Comments",
      description: "Get notified when someone comments on your issues",
    },
    {
      key: "notify_deadlines",
      label: "Upcoming Deadlines",
      description: "Get notified about issues nearing their due date",
    },
    {
      key: "notify_mentions",
      label: "Mentions",
      description: "Get notified when someone mentions you",
    },
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-[#555]">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0D0D0D] flex flex-col">
      <div className="px-6 py-4 border-b border-[#1E1E1E] flex items-center gap-3">
        <Link
          to={createPageUrl("MyIssues")}
          className="p-1 text-[#555] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-lg font-semibold text-white">Notification Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
            <h2 className="text-sm font-semibold text-white mb-4">
              Notification Preferences
            </h2>
            <p className="text-xs text-[#999] mb-6">
              Choose which notifications you'd like to receive
            </p>

            <div className="space-y-4">
              {notificationTypes.map((type) => (
                <div
                  key={type.key}
                  className="flex items-center justify-between p-4 bg-[#0D0D0D] border border-[#1E1E1E] rounded-lg hover:border-[#252525] transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white">
                      {type.label}
                    </h3>
                    <p className="text-xs text-[#999] mt-1">
                      {type.description}
                    </p>
                  </div>
                  <Switch
                    checked={settings[type.key]}
                    onCheckedChange={() => handleToggle(type.key)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111] border border-[#1E1E1E] rounded-lg p-6">
            <h2 className="text-sm font-semibold text-white mb-2">
              About Notifications
            </h2>
            <p className="text-xs text-[#999]">
              Notifications are delivered in real-time and appear in the
              notification center. Your preferences are saved automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}