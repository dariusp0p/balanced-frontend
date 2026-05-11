import type { ChangeEvent, FormEvent } from "react";
import { Camera, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { FoodLogForm, type FoodLogFormValues } from "./FoodLogForm";

type AiFoodLogContentProps = {
  form: FoodLogFormValues;
  error: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
  onOpenCamera: () => void;
};

export function AiFoodLogContent({
  form,
  error,
  onChange,
  onSubmit,
  onOpenCamera,
}: AiFoodLogContentProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onOpenCamera}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan/85"
        >
          <Camera className="h-4 w-4" />
          <span>Take Photo</span>
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Photo</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setSelectedFileName(file?.name ?? "");
        }}
      />

      {selectedFileName ? (
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          {selectedFileName}
        </div>
      ) : null}

      <FoodLogForm form={form} error={error} onChange={onChange} onSubmit={onSubmit} />
    </div>
  );
}
