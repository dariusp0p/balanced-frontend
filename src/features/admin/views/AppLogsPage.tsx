import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Eye, ScrollText } from "lucide-react";

import { BottomNav } from "../../dashboard/views/components/BottomNav";
import { useFoodLogs } from "../../food/store/FoodLogContext";
import {
  fetchAppLogs,
  fetchObservedUsers,
} from "../services/AuditRepository";
import type { AppActionLog, ObservedUser } from "../types/audit";

export function AppLogsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOffline, pendingSyncCount } = useFoodLogs();
  const [logs, setLogs] = useState<AppActionLog[]>([]);
  const [observedUsers, setObservedUsers] = useState<ObservedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const streakDays = 12; // Mock streak data
  const connectionStatus: "offline" | "syncing" | "synced" = isOffline
    ? "offline"
    : pendingSyncCount > 0
      ? "syncing"
      : "synced";

  useEffect(() => {
    Promise.all([fetchAppLogs(), fetchObservedUsers()])
      .then(([nextLogs, nextObserved]) => {
        setLogs(nextLogs);
        setObservedUsers(nextObserved);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-dark-blue px-4 py-4 text-white">
        <div className="mx-auto flex w-full max-w-[480px] items-center gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
            aria-label="Back to settings"
            onClick={() => navigate("/settings")}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">App Logs</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[480px] space-y-5 px-4 pb-28 pt-6">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange/10 text-orange">
              <Eye className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-dark-blue">
              Observation List
            </h2>
          </div>
          {observedUsers.length === 0 ? (
            <div className="text-sm text-gray-500">No observed users.</div>
          ) : (
            <div className="space-y-3">
              {observedUsers.map((user) => (
                <div key={user.id} className="rounded-xl bg-amber-50 p-3">
                  <div className="text-sm font-semibold text-dark-blue">
                    {user.userName}
                  </div>
                  <div className="text-xs text-gray-600">{user.reason}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dark-blue/5 text-dark-blue">
              <ScrollText className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-dark-blue">
              Action History
            </h2>
          </div>
          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={log.id}
                className={`px-5 py-4 ${index > 0 ? "border-t border-gray-100" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 text-sm font-semibold text-dark-blue">
                    {log.userName}
                  </div>
                  <div className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {log.groupId}
                  </div>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {log.actionInformation}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      <BottomNav
        navigate={navigate}
        currentPath={location.pathname}
        streakDays={streakDays}
        connectionStatus={connectionStatus}
      />
    </div>
  );
}
