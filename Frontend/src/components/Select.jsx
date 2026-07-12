function Select({
  label,
  value,
  onChange,
  disabled = false,
  children,
  className = "",
  selectClassName = "",
}) {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`appearance-none w-full pl-4 pr-10 py-2.5 rounded-xl border text-sm font-medium shadow-sm outline-none transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${selectClassName}`}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}

export default Select;
