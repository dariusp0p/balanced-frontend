import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

import { FoodLogItem } from "../dashboard/components/FoodLogItem";
import { useFoodLogs } from "./FoodLogContext";
import { fetchFoodLogsPageApi } from "./foodApi";
import type { FoodLog } from "./FoodLogContext";

type PageState = {
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
};

const PAGE_SIZE = 5;

export function InfiniteFoodLogsPage() {
  const navigate = useNavigate();
  const { deleteFoodLog } = useFoodLogs();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [state, setState] = useState<PageState>({
    page: -1,
    totalPages: 0,
    isLoading: false,
    error: null,
  });

  const hasMore = useMemo(() => {
    if (state.totalPages === 0) return false;
    return state.page + 1 < state.totalPages;
  }, [state.page, state.totalPages]);

  const loadPage = async (targetPage: number) => {
    if (state.isLoading) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetchFoodLogsPageApi(targetPage, PAGE_SIZE);

      setLogs((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const nextItems = response.content.filter((item) => !seen.has(item.id));
        return [...prev, ...nextItems];
      });

      setState((prev) => ({
        ...prev,
        page: response.page,
        totalPages: response.totalPages,
        isLoading: false,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load logs";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  };

  useEffect(() => {
    void loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;
        if (!hasMore || state.isLoading) return;
        void loadPage(state.page + 1);
      },
      {
        root: null,
        rootMargin: "300px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, state.isLoading, state.page]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-dark-blue text-white px-6 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 hover:text-cyan transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-lg font-semibold">Infinite Food Logs</h1>
        <div className="w-10" />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <p className="mb-4 text-sm text-gray-500">
          Backend pagination demo using infinite scroll.
        </p>

        {logs.length === 0 && !state.isLoading && !state.error && (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            No food logs found.
          </div>
        )}

        <div className="flex flex-col gap-6">
          {logs.map((log) => (
            <FoodLogItem key={log.id} {...log} onDelete={deleteFoodLog} />
          ))}
        </div>

        {state.error && (
          <div className="mt-4 rounded-md border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {state.error}
          </div>
        )}

        {state.isLoading && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Loading...
          </div>
        )}

        {!state.isLoading && !hasMore && logs.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            You reached the end.
          </div>
        )}

        <div ref={sentinelRef} className="h-10" aria-hidden="true" />
      </main>
    </div>
  );
}
