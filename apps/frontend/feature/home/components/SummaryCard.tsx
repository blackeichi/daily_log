export const SummaryCard = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="rounded-lg border border-stone-100 bg-white px-4 py-5 shadow-lg shadow-stone-500">
      <div className="text-xs text-stone-500 sm:text-sm">{label}</div>
      <div className="mt-2 text-lg font-semibold text-stone-800 sm:text-xl">
        {value}
      </div>
    </div>
  );
};
