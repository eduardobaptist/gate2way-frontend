export const Field = ({ label, value }) => (
  <div className="min-w-0 space-y-1.5">
    <div className="text-sm font-semibold text-gray-900">{label}</div>
    <div className="break-words text-sm text-gray-600">{value}</div>
  </div>
);
