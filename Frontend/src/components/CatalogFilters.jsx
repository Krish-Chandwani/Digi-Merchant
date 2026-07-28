import Select from "./Select";

const selectStyles =
  "border-gray-200 bg-white text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100";

/**
 * Shared filter bar used for product and shop catalogs.
 */
function CatalogFilters({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  category,
  onCategoryChange,
  categories = [],
  categoryAllLabel = "All Categories",
  sort,
  onSortChange,
  sortOptions = [],
  extraLabel,
  extraValue,
  onExtraChange,
  extraOptions,
}) {
  const showExtra = Array.isArray(extraOptions) && extraOptions.length > 0;

  return (
    <div
      className={`bg-white rounded-2xl shadow p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 ${
        showExtra ? "lg:grid-cols-4" : "lg:grid-cols-3"
      }`}
    >
      <div className={showExtra ? "sm:col-span-2 lg:col-span-1" : ""}>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Search
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </div>

      <Select
        label="Category"
        value={category}
        onChange={onCategoryChange}
        selectClassName={selectStyles}
      >
        <option value="">{categoryAllLabel}</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </Select>

      <Select
        label="Sort by"
        value={sort}
        onChange={onSortChange}
        selectClassName={selectStyles}
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>

      {showExtra && (
        <Select
          label={extraLabel}
          value={extraValue}
          onChange={onExtraChange}
          selectClassName={selectStyles}
        >
          {extraOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      )}
    </div>
  );
}

export default CatalogFilters;
