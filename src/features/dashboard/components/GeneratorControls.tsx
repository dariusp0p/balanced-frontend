import { useState } from "react";
import {
  startFoodLogGenerator,
  stopFoodLogGenerator,
} from "../../food/foodApi";

type GeneratorControlsProps = {
  defaultDate: string;
};

export function GeneratorControls({ defaultDate }: GeneratorControlsProps) {
  const [date, setDate] = useState(defaultDate);
  const [batchSize, setBatchSize] = useState(5);
  const [intervalMs, setIntervalMs] = useState(2000);
  const [isRunning, setIsRunning] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsBusy(true);
    setError(null);

    try {
      if (!date) {
        setError("Date is required.");
        return;
      }

      await startFoodLogGenerator(date, batchSize, intervalMs);
      setIsRunning(true);
    } catch {
      setError("Failed to start generator.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleStop = async () => {
    setIsBusy(true);
    setError(null);

    try {
      await stopFoodLogGenerator();
      setIsRunning(false);
    } catch {
      setError("Failed to stop generator.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed right-4 bottom-24 md:right-6 md:bottom-6 z-50 w-[300px] rounded-xl border border-slate-200 bg-white shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">Generator Test</h3>
        <span
          className={`text-xs font-medium ${
            isRunning ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          {isRunning ? "running" : "stopped"}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <label className="text-xs text-slate-600 block">
          Date
          <input
            type="date"
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isBusy || isRunning}
            required
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <label className="text-xs text-slate-600">
          Batch size
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={batchSize}
            onChange={(e) => setBatchSize(Math.max(1, Number(e.target.value)))}
            disabled={isBusy || isRunning}
          />
        </label>
        <label className="text-xs text-slate-600">
          Interval (ms)
          <input
            type="number"
            min={250}
            step={100}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
            value={intervalMs}
            onChange={(e) =>
              setIntervalMs(Math.max(250, Number(e.target.value)))
            }
            disabled={isBusy || isRunning}
          />
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 disabled:opacity-60"
          onClick={handleStart}
          disabled={isBusy || isRunning}
        >
          Start
        </button>
        <button
          type="button"
          className="flex-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2 disabled:opacity-60"
          onClick={handleStop}
          disabled={isBusy || !isRunning}
        >
          Stop
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
