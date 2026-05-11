import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { Bell, ChevronRight, LogOut, Moon, ScrollText, Shield } from "lucide-react";

import { BottomNav } from "../../dashboard/views/components/BottomNav";

type SettingsItem = {
  label: string;
  value: string;
  Icon: typeof Bell;
  onClick?: () => void;
};

function isAdminUser() {
  if (localStorage.getItem("isAdmin") === "true") return true;
  try {
    const raw = localStorage.getItem("currentUser");
    if (!raw) return false;
    return Boolean(JSON.parse(raw).admin);
  } catch {
    return false;
  }
}

export function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = isAdminUser();

  const sections = useMemo(() => {
    const appItems: SettingsItem[] = [
      { label: "Notifications", value: "Daily reminders", Icon: Bell },
      { label: "Appearance", value: "System", Icon: Moon },
      { label: "Privacy", value: "Local-first sync", Icon: Shield },
    ];

    const adminItems: SettingsItem[] = admin
      ? [
          {
            label: "App Logs",
            value: "Actions and observed users",
            Icon: ScrollText,
            onClick: () => navigate("/admin/logs"),
          },
        ]
      : [];

    return [
      { title: "App", items: appItems },
      ...(adminItems.length > 0 ? [{ title: "Admin", items: adminItems }] : []),
    ];
  }, [admin, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-dark-blue px-4 py-4 text-white">
        <div className="mx-auto flex w-full max-w-[480px] items-center justify-between">
          <h1 className="text-xl font-semibold">Settings</h1>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/15"
            aria-label="Log out"
            title="Log out"
            onClick={() => navigate("/")}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[480px] space-y-6 px-4 pb-28 pt-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase text-gray-400">
              {section.title}
            </h2>
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {section.items.map(({ label, value, Icon, onClick }, index) => (
                <button
                  key={label}
                  type="button"
                  className={`flex w-full items-center gap-4 px-5 py-4 text-left ${
                    index > 0 ? "border-t border-gray-100" : ""
                  } ${onClick ? "transition-colors hover:bg-gray-50" : ""}`}
                  onClick={onClick}
                  disabled={!onClick}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dark-blue/5 text-dark-blue">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-dark-blue">
                      {label}
                    </div>
                    <div className="truncate text-sm text-gray-500">{value}</div>
                  </div>
                  {onClick ? (
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>

      <BottomNav navigate={navigate} currentPath={location.pathname} />
    </div>
  );
}
