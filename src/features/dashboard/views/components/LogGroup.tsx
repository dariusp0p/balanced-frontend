import { Edit2, Trash2 } from "lucide-react";
import { FoodLogItem } from "./FoodLogItem";
import type { FoodLog, FoodLogGroup } from "../../../food/types/foodLog";

interface LogGroupProps {
  group: FoodLogGroup;
  logs: FoodLog[];
  onRenameGroup: (groupId: number, name: string) => Promise<void>;
  onDeleteGroup: (groupId: number) => Promise<void>;
  onDeleteFoodLog: (id: number) => void;
  draggingLogId: number | null;
  hoveredGroupId: number | null;
  onDragStartLog: (id: number) => void;
  onDragEndLog: () => void;
  onPointerDownLog: (id: number, x: number, y: number) => void;
  onPointerMoveLog: (x: number, y: number) => void;
  onPointerUpLog: (x: number, y: number) => void;
  onPointerCancelLog: () => void;
  onDropLog: (groupId: number) => void;
  onHoverGroup: (groupId: number | null) => void;
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
  onRenameGroup,
  onDeleteGroup,
  onDeleteFoodLog,
  draggingLogId,
  hoveredGroupId,
  onDragStartLog,
  onDragEndLog,
  onPointerDownLog,
  onPointerMoveLog,
  onPointerUpLog,
  onPointerCancelLog,
  onDropLog,
  onHoverGroup,
}: LogGroupProps) {
  const totals = formatGroupTotals(logs);
  const isStandardGroup =
    group.mealType === "BREAKFAST" ||
    group.mealType === "LUNCH" ||
    group.mealType === "DINNER" ||
    group.mealType === "SNACK";
  const isDragTarget = draggingLogId !== null;
  const isHovered = hoveredGroupId === group.id;

  return (
    <section
      data-drop-group-id={group.id}
      onDragOver={(e) => {
        e.preventDefault();
        onHoverGroup(group.id);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          onHoverGroup(null);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDropLog(group.id);
      }}
      className={`rounded-xl border bg-transparent p-4 transition-colors ${
        isHovered
          ? "border-cyan bg-cyan/10 shadow-sm"
          : isDragTarget
            ? "border-orange bg-orange/5"
            : "border-orange/35"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-orange">
            {group.name}
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-orange">
          <span>{totals.calories} cals</span>
          <span>P {totals.protein}g</span>
          <span>C {totals.carbs}g</span>
          <span>F {totals.fats}g</span>
        </div>
      </div>

      {!isStandardGroup && (
        <div className="mb-4 flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => {
              const nextName = window.prompt("Rename group", group.name);
              if (!nextName || !nextName.trim()) return;
              void onRenameGroup(group.id, nextName);
            }}
            className="rounded p-2 transition-colors hover:bg-orange/10"
            title="Rename group"
          >
            <Edit2 className="text-orange transition-colors" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Delete this group and all logs inside it?")) {
                void onDeleteGroup(group.id);
              }
            }}
            className="rounded p-2 transition-colors hover:bg-red-100"
            title="Delete group"
          >
            <Trash2 className="text-orange transition-colors hover:text-red-600" />
          </button>
        </div>
      )}

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
              <FoodLogItem
                {...log}
                draggable
                isDragging={draggingLogId === log.id}
                onDelete={onDeleteFoodLog}
                onDragStartLog={onDragStartLog}
                onDragEndLog={onDragEndLog}
                onPointerDownLog={onPointerDownLog}
                onPointerMoveLog={onPointerMoveLog}
                onPointerUpLog={onPointerUpLog}
                onPointerCancelLog={onPointerCancelLog}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
