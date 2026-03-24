import { ChevronLeft, ChevronRight } from "lucide-react";

export function DateNavigation() {
  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <button className="hover:bg-gray-100 p-1 rounded">
        <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
      </button>
      <span className="text-sm font-medium">today</span>
      <button className="hover:bg-gray-100 p-1 rounded">
        <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
      </button>
    </div>
  );
}
