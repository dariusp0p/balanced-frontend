type UnavailableFoodLogContentProps = {
  title: string;
};

export function UnavailableFoodLogContent({
  title,
}: UnavailableFoodLogContentProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-10 text-center text-white/75">
      <h2 className="mb-2 text-lg font-semibold text-white">{title}</h2>
      <p className="text-sm">Not available for now.</p>
    </div>
  );
}
