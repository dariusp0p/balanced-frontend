import { Link, useNavigate } from "react-router";
import { Trash2, Edit2 } from "lucide-react";
import { useRef } from "react";

interface FoodLogItemProps {
  id: number;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  onDelete: (id: number) => void;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStartLog?: (id: number) => void;
  onDragEndLog?: () => void;
  onPointerDownLog?: (id: number, x: number, y: number) => void;
  onPointerMoveLog?: (x: number, y: number) => void;
  onPointerUpLog?: (x: number, y: number) => void;
  onPointerCancelLog?: () => void;
}

export function FoodLogItem({
  id,
  name,
  time,
  calories,
  protein,
  carbs,
  fats,
  onDelete,
  draggable = false,
  isDragging = false,
  onDragStartLog,
  onDragEndLog,
  onPointerDownLog,
  onPointerMoveLog,
  onPointerUpLog,
  onPointerCancelLog,
}: FoodLogItemProps) {
  const navigate = useNavigate();
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const suppressNextClick = useRef(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this food log?")) {
      onDelete(id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/log-food?edit=${id}`);
  };

  return (
    <Link
      to={`/food/${id}`}
      draggable={false}
      onClickCapture={(e) => {
        if (!suppressNextClick.current) return;
        suppressNextClick.current = false;
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        draggable={draggable}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", String(id));
          onDragStartLog?.(id);
        }}
        onDragEnd={onDragEndLog}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
          pointerStart.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
          onPointerDownLog?.(id, e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (!pointerStart.current) return;
          const dx = e.clientX - pointerStart.current.x;
          const dy = e.clientY - pointerStart.current.y;
          if (Math.hypot(dx, dy) > 8) {
            suppressNextClick.current = true;
          }
          onPointerMoveLog?.(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          pointerStart.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
          onPointerUpLog?.(e.clientX, e.clientY);
        }}
        onPointerCancel={() => {
          pointerStart.current = null;
          onPointerCancelLog?.();
        }}
        className={`flex cursor-grab touch-none select-none items-center gap-4 rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md active:cursor-grabbing ${
          isDragging ? "scale-[0.99] opacity-60 shadow-lg" : ""
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-dark-blue">{name}</h3>
            <span className="text-orange font-medium">{calories} cals</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3 text-center">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-orange">
                {protein}g
              </div>
              <div className="text-[11px] text-gray-400">protein</div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-300">{carbs}g</div>
              <div className="text-[11px] text-gray-400">carbs</div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#3B7B8F]">{fats}g</div>
              <div className="text-[11px] text-gray-400">fats</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          data-no-drag
          onClick={handleEdit}
          className="ml-2 p-2 rounded hover:bg-blue-100 group"
          title="Edit"
        >
          <Edit2 className="text-gray-400 group-hover:text-blue-600 transition-colors" />
        </button>
        <button
          type="button"
          data-no-drag
          data-testid="delete-food-log"
          onClick={handleDelete}
          className="ml-2 p-2 rounded hover:bg-red-100 group"
          title="Delete"
        >
          <Trash2 className="text-gray-400 group-hover:text-red-600 transition-colors" />
        </button>
      </div>
    </Link>
  );
}
