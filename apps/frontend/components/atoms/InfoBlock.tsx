export const InfoBlock = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
      <h4 className="mb-2 text-sm font-semibold text-gray-700">{label}</h4>
      <div className="min-h-[72px] whitespace-pre-wrap break-words rounded-xl bg-white px-3 py-3 text-sm leading-6 text-gray-800 border border-gray-100">
        {value?.trim() ? (
          value
        ) : (
          <span className="text-gray-400">기록 없음</span>
        )}
      </div>
    </div>
  );
};
