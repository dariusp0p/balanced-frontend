import { useMemo, useRef, useState } from "react";
import { FoodLogItem } from "./FoodLogItem";
import { LogGroup } from "./LogGroup";
import type { FoodLog, FoodLogGroup } from "../../../food/types/foodLog";

interface FoodLogsProps {
  foodLogs: FoodLog[];
  groups: FoodLogGroup[];
  selectedDate: string;
  onDeleteFoodLog: (id: number) => void;
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
  onDeleteFoodLog,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  onAssignLogToGroup,
  getGroupForLog,
  onAdd,
}: FoodLogsProps) {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [draggedLogId, setDraggedLogId] = useState<number | null>(null);
  const [hoveredGroupId, setHoveredGroupId] = useState<number | null>(null);
  const draggedLogIdRef = useRef<number | null>(null);
  const pointerDragRef = useRef<{
    id: number;
    startX: number;
    startY: number;
    isDragging: boolean;
  } | null>(null);
  const orderedGroups = useMemo(() => {
    const standardOrder: Record<string, number> = {
      BREAKFAST: 0,
      LUNCH: 1,
      DINNER: 2,
      SNACK: 3,
    };

    return [...groups].sort((a, b) => {
      const aOrder = standardOrder[a.mealType ?? ""] ?? 99;
      const bOrder = standardOrder[b.mealType ?? ""] ?? 99;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      if (aOrder === 99) {
        return a.name.localeCompare(b.name);
      }

      return a.id - b.id;
    });
  }, [groups]);

  const logsByGroup = useMemo(() => {
    const grouped = new Map<number, FoodLog[]>();
    orderedGroups.forEach((group) => grouped.set(group.id, []));

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
  }, [foodLogs, orderedGroups, getGroupForLog]);

  const handleCreateGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    await onCreateGroup(name);
    setNewGroupName("");
    setIsCreateGroupOpen(false);
  };

  const setActiveDrag = (logId: number | null) => {
    draggedLogIdRef.current = logId;
    setDraggedLogId(logId);
    if (logId === null) {
      setHoveredGroupId(null);
    }
  };

  const getDropGroupIdAtPoint = (x: number, y: number) => {
    const target = document
      .elementsFromPoint(x, y)
      .map((element) => element.closest("[data-drop-group-id]"))
      .find(Boolean);

    const value = target?.getAttribute("data-drop-group-id");
    return value ? Number(value) : null;
  };

  const assignDraggedLogToGroup = (groupId: number) => {
    const logId = draggedLogIdRef.current;
    if (!logId) return;
    if (getGroupForLog(logId) === groupId) return;
    void onAssignLogToGroup(logId, groupId);
  };

  const finishDrag = () => {
    pointerDragRef.current = null;
    setActiveDrag(null);
  };

  const renderLogs = (logs: FoodLog[]) => (
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
            isDragging={draggedLogId === log.id}
            onDelete={onDeleteFoodLog}
            onDragStartLog={setActiveDrag}
            onDragEndLog={finishDrag}
            onPointerDownLog={(id, x, y) => {
              pointerDragRef.current = {
                id,
                startX: x,
                startY: y,
                isDragging: false,
              };
            }}
            onPointerMoveLog={(x, y) => {
              const active = pointerDragRef.current;
              if (!active) return;

              const distance = Math.hypot(x - active.startX, y - active.startY);
              if (!active.isDragging && distance > 8) {
                active.isDragging = true;
                setActiveDrag(active.id);
              }
              if (!active.isDragging) return;

              setHoveredGroupId(getDropGroupIdAtPoint(x, y));
            }}
            onPointerUpLog={(x, y) => {
              const active = pointerDragRef.current;
              if (active?.isDragging) {
                const groupId =
                  hoveredGroupId ?? getDropGroupIdAtPoint(x, y);
                if (groupId !== null) {
                  assignDraggedLogToGroup(groupId);
                }
              }
              finishDrag();
            }}
            onPointerCancelLog={finishDrag}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="flex w-full items-center justify-center rounded-xl bg-orange px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange/90"
            onClick={() => onAdd()}
          >
            Log Food
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center rounded-xl bg-cyan px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan/85"
            onClick={() => setIsCreateGroupOpen(true)}
          >
            Create Group
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

      <div className="space-y-6">
        {orderedGroups.map((group) => {
          const groupLogs = logsByGroup.grouped.get(group.id) || [];
          return (
            <LogGroup
              key={group.id}
              group={group}
              logs={groupLogs}
              onRenameGroup={onRenameGroup}
              onDeleteGroup={onDeleteGroup}
              onDeleteFoodLog={onDeleteFoodLog}
              draggingLogId={draggedLogId}
              hoveredGroupId={hoveredGroupId}
              onDragStartLog={setActiveDrag}
              onDragEndLog={finishDrag}
              onPointerDownLog={(id, x, y) => {
                pointerDragRef.current = {
                  id,
                  startX: x,
                  startY: y,
                  isDragging: false,
                };
              }}
              onPointerMoveLog={(x, y) => {
                const active = pointerDragRef.current;
                if (!active) return;

                const distance = Math.hypot(
                  x - active.startX,
                  y - active.startY,
                );
                if (!active.isDragging && distance > 8) {
                  active.isDragging = true;
                  setActiveDrag(active.id);
                }
                if (!active.isDragging) return;

                setHoveredGroupId(getDropGroupIdAtPoint(x, y));
              }}
              onPointerUpLog={(x, y) => {
                const active = pointerDragRef.current;
                if (active?.isDragging) {
                  const groupId =
                    hoveredGroupId ?? getDropGroupIdAtPoint(x, y);
                  if (groupId !== null) {
                    assignDraggedLogToGroup(groupId);
                  }
                }
                finishDrag();
              }}
              onPointerCancelLog={finishDrag}
              onDropLog={(groupId) => {
                assignDraggedLogToGroup(groupId);
                finishDrag();
              }}
              onHoverGroup={setHoveredGroupId}
            />
          );
        })}

        {logsByGroup.ungrouped.length > 0 && renderLogs(logsByGroup.ungrouped)}
      </div>

      {foodLogs.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          No logs for this day yet.
        </div>
      )}
    </div>
  );
}
