const STEPS = [
  { key: "pending", label: "Placed" },
  { key: "accepted", label: "Accepted" },
  { key: "delivered", label: "Delivered" },
];

const ORDER = ["pending", "accepted", "delivered"];

function normalize(status) {
  return status === "completed" ? "delivered" : status;
}

function formatTime(date) {
  if (!date) return null;
  return new Date(date).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrderTimeline({ status, statusHistory = [] }) {
  const historyMap = statusHistory.reduce((acc, entry) => {
    if (!acc[entry.status]) acc[entry.status] = entry.at;
    return acc;
  }, {});

  const isCancelled = status === "cancelled";
  const current = ORDER.indexOf(normalize(status));

  if (isCancelled) {
    const cancelledAt = historyMap.cancelled;
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white text-xs">
            ✓
          </span>
          <span className="text-sm font-medium text-gray-700">Placed</span>
        </div>

        <span className="flex-1 h-0.5 bg-red-300" />

        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
            ✕
          </span>
          <div>
            <span className="text-sm font-semibold text-red-600">Cancelled</span>
            {formatTime(cancelledAt) && (
              <p className="text-xs text-gray-400">{formatTime(cancelledAt)}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start">
      {STEPS.map((step, index) => {
        const stepIndex = ORDER.indexOf(step.key);
        let state = "upcoming";
        if (stepIndex < current) state = "completed";
        else if (stepIndex === current) state = "current";

        const dotClass =
          state === "completed"
            ? "bg-green-600 text-white"
            : state === "current"
              ? "bg-green-600 text-white ring-4 ring-green-100"
              : "bg-gray-200 text-gray-400";

        const labelClass =
          state === "upcoming"
            ? "text-gray-400"
            : state === "current"
              ? "text-green-700 font-semibold"
              : "text-gray-700";

        const time = formatTime(historyMap[step.key]);

        return (
          <div key={step.key} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              <span
                className={`h-0.5 flex-1 ${
                  index === 0
                    ? "bg-transparent"
                    : stepIndex <= current
                      ? "bg-green-600"
                      : "bg-gray-200"
                }`}
              />
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${dotClass}`}
              >
                {state === "completed" ? "✓" : stepIndex + 1}
              </span>
              <span
                className={`h-0.5 flex-1 ${
                  index === STEPS.length - 1
                    ? "bg-transparent"
                    : stepIndex < current
                      ? "bg-green-600"
                      : "bg-gray-200"
                }`}
              />
            </div>

            <span className={`mt-2 text-xs sm:text-sm ${labelClass}`}>
              {step.label}
            </span>
            {time && <span className="text-[10px] text-gray-400">{time}</span>}
          </div>
        );
      })}
    </div>
  );
}

export default OrderTimeline;
