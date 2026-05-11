import { useMemo, useState } from "react";
import { FoodLogItem } from "./FoodLogItem";
import { LogGroup } from "./LogGroup";
import { useFoodLogs } from "../../../food/store/FoodLogContext";
import type { FoodLog, FoodLogGroup } from "../../../food/types/foodLog";

interface FoodLogsProps {
  foodLogs: FoodLog[];
  groups: FoodLogGroup[];
  selectedDate: string;
  onCreateGroup: (name: string) => Promise<number>;
  onRenameGroup: (groupId: number, name: string) => Promise<void>;
  onDeleteGroup: (groupId: number) => Promise<void>;
  onAssignLogToGroup: (
    foodLogId: number,
    groupId: number | null,
  ) => Promise<void>;
  getGroupForLog: (foodLogId: number) => number | null;
  onAdd: (groupId?: number) => void;
}

export function FoodLogs({
  foodLogs,
  groups,
  selectedDate,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  onAssignLogToGroup,
  getGroupForLog,
  onAdd,
}: FoodLogsProps) {
  const { deleteFoodLog } = useFoodLogs();
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const logsByGroup = useMemo(() => {
    const grouped = new Map<number, FoodLog[]>();
    groups.forEach((group) => grouped.set(group.id, []));

    const ungrouped: FoodLog[] = [];
    foodLogs.forEach((log) => {
      const groupId = getGroupForLog(log.id);
      if (!groupId || !grouped.has(groupId)) {
        ungrouped.push(log);
        return;
      }
      grouped.get(groupId)?.push(log);
    });

    return { grouped, ungrouped };
  }, [foodLogs, groups, getGroupForLog]);

  const handleCreateGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    await onCreateGroup(name);
    setNewGroupName("");
    setIsCreateGroupOpen(false);
  };

  const renderGroupSelector = (logId: number) => {
    const selectedGroupId = getGroupForLog(logId) || "";
    return (
      <div className="mt-2 flex items-center gap-2">
        <label
          htmlFor={`group-select-${selectedDate}-${logId}`}
          className="text-xs text-gray-500"
        >
          Group
        </label>
        <select
          id={`group-select-${selectedDate}-${logId}`}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
          value={selectedGroupId ?? ""}
          onChange={(e) => {
            const nextValue = e.target.value;
            void onAssignLogToGroup(
              logId,
              nextValue ? Number(nextValue) : null,
            );
          }}
        >
          <option value="">Ungrouped</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderLogs = (logs: FoodLog[]) => (
    <div className="space-y-4 md:space-y-3 flex flex-col gap-2">
      {logs.map((log, idx) => (
        <div
          key={log.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${idx * 120}ms` }}
        >
          <FoodLogItem {...log} onDelete={deleteFoodLog} />
          {renderGroupSelector(log.id)}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-4 px-0 md:px-0">
        <h2 className="text-lg md:text-sm font-medium text-gray-600">
          today's logs
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-gray-600 text-sm hover:underline"
            onClick={() => setIsCreateGroupOpen(true)}
          >
            group +
          </button>
          <button
            type="button"
            className="text-orange text-sm hover:underline"
            onClick={() => onAdd()}
          >
            add +
          </button>
        </div>
      </div>

      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Group
              </h3>
              <button
                type="button"
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                onClick={() => {
                  setIsCreateGroupOpen(false);
                  setNewGroupName("");
                }}
                aria-label="Close modal"
              >
                x
              </button>
            </div>
            <input
              autoFocus
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleCreateGroup();
                }
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setIsCreateGroupOpen(false);
                  setNewGroupName("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                onClick={() => {
                  void handleCreateGroup();
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {logsByGroup.ungrouped.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Ungrouped</h3>
            <span className="text-xs text-gray-500">
              {logsByGroup.ungrouped.length} logs
            </span>
          </div>
          {renderLogs(logsByGroup.ungrouped)}
        </div>
      )}

      <div className="space-y-6">
        {groups.map((group) => {
          const groupLogs = logsByGroup.grouped.get(group.id) || [];
          return (
            <LogGroup
              key={group.id}
              group={group}
              logs={groupLogs}
              allGroups={groups}
              selectedDate={selectedDate}
              onRenameGroup={onRenameGroup}
              onDeleteGroup={onDeleteGroup}
              onAssignLogToGroup={onAssignLogToGroup}
              getGroupForLog={getGroupForLog}
              onDeleteFoodLog={deleteFoodLog}
              onAddFoodLog={(groupId) => onAdd(groupId)}
            />
          );
        })}
      </div>

      {foodLogs.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          No logs for this day yet.
        </div>
      )}
    </div>
  );
}
