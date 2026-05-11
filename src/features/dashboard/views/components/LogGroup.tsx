import { Edit2, Plus, Trash2 } from "lucide-react";
import { FoodLogItem } from "./FoodLogItem";
import type { FoodLog, FoodLogGroup } from "../../../food/types/foodLog";

interface LogGroupProps {
  group: FoodLogGroup;
  logs: FoodLog[];
  allGroups: FoodLogGroup[];
  selectedDate: string;
  onRenameGroup: (groupId: number, name: string) => Promise<void>;
  onDeleteGroup: (groupId: number) => Promise<void>;
  onAssignLogToGroup: (
    foodLogId: number,
    groupId: number | null,
  ) => Promise<void>;
  getGroupForLog: (foodLogId: number) => number | null;
  onDeleteFoodLog: (id: number) => void;
  onAddFoodLog: (groupId: number) => void;
}

function formatGroupTotals(logs: FoodLog[]) {
  return logs.reduce(
    (acc, log) => {
      acc.calories += log.calories;
      acc.protein += log.protein;
      acc.carbs += log.carbs;
      acc.fats += log.fats;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );
}

export function LogGroup({
  group,
  logs,
  allGroups,
  selectedDate,
  onRenameGroup,
  onDeleteGroup,
  onAssignLogToGroup,
  getGroupForLog,
  onDeleteFoodLog,
  onAddFoodLog,
}: LogGroupProps) {
  const totals = formatGroupTotals(logs);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {group.name}
          </h3>
          <p className="text-xs text-gray-500">{logs.length} logs</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span>{totals.calories} cals</span>
          <span>P {totals.protein}g</span>
          <span>C {totals.carbs}g</span>
          <span>F {totals.fats}g</span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => onAddFoodLog(group.id)}
          className="p-2 rounded hover:bg-emerald-100 group"
          title="Add food log"
        >
          <Plus className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
        </button>
        <button
          type="button"
          onClick={() => {
            const nextName = window.prompt("Rename group", group.name);
            if (!nextName || !nextName.trim()) return;
            void onRenameGroup(group.id, nextName);
          }}
          className="p-2 rounded hover:bg-blue-100 group"
          title="Rename group"
        >
          <Edit2 className="text-gray-400 group-hover:text-blue-600 transition-colors" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Delete this group and all logs inside it?")) {
              void onDeleteGroup(group.id);
            }
          }}
          className="p-2 rounded hover:bg-red-100 group"
          title="Delete group"
        >
          <Trash2 className="text-gray-400 group-hover:text-red-600 transition-colors" />
        </button>
      </div>

      {logs.length === 0 ? (
        <p className="text-sm text-gray-500">No logs in this group yet.</p>
      ) : (
        <div className="space-y-4 md:space-y-3 flex flex-col gap-2">
          {logs.map((log, idx) => (
            <div
              key={log.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <FoodLogItem {...log} onDelete={onDeleteFoodLog} />
              <div className="mt-2 flex items-center gap-2">
                <label
                  htmlFor={`group-select-${selectedDate}-${log.id}`}
                  className="text-xs text-gray-500"
                >
                  Group
                </label>
                <select
                  id={`group-select-${selectedDate}-${log.id}`}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                  value={getGroupForLog(log.id) ?? ""}
                  onChange={(e) =>
                    void onAssignLogToGroup(
                      log.id,
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                >
                  <option value="">Ungrouped</option>
                  {allGroups.map((optionGroup) => (
                    <option key={optionGroup.id} value={optionGroup.id}>
                      {optionGroup.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
