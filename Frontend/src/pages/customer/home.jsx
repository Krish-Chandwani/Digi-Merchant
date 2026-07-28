import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import ShopCard from "../../components/ShopCard";
import CatalogFilters from "../../components/CatalogFilters";

const SHOP_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
];

function Home() {
  const [shops, setShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await api.get("/shops");
        setShops(res.data.shops || []);
      } catch (err) {
        console.error("Error fetching shops:", err);
        setError("Failed to load shops");
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(shops.map((shop) => shop.category).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b));
  }, [shops]);

  const filteredShops = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    let list = shops.filter((shop) => {
      if (category && shop.category !== category) return false;

      if (!q) return true;

      return (
        (shop.name || "").toLowerCase().includes(q) ||
        (shop.category || "").toLowerCase().includes(q) ||
        (shop.address || "").toLowerCase().includes(q) ||
        (shop.description || "").toLowerCase().includes(q)
      );
    });

    list = [...list];
    if (sort === "name_asc") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sort === "name_desc") {
      list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    } else {
      list.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return list;
  }, [shops, searchTerm, category, sort]);

  const hasActiveFilters =
    searchTerm.trim() || category || sort !== "newest";

  const clearFilters = () => {
    setSearchTerm("");
    setCategory("");
    setSort("newest");
  };

  if (loading) {
    return (
      <div className="p-6 text-lg text-gray-600">Loading shops...</div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Local Shops Near You
          </h1>

          <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto">
            Support nearby businesses and order products easily from trusted
            local merchants.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Available Shops
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredShops.length} shop
              {filteredShops.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        <CatalogFilters
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          searchPlaceholder="Search shops..."
          category={category}
          onCategoryChange={(e) => setCategory(e.target.value)}
          categories={categories}
          sort={sort}
          onSortChange={(e) => setSort(e.target.value)}
          sortOptions={SHOP_SORT_OPTIONS}
        />

        {filteredShops.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No shops found
            </h3>
            <p className="text-gray-500">
              {hasActiveFilters
                ? "Try changing your search or filters."
                : "No shops available yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredShops.map((shop) => (
              <ShopCard key={shop._id} shop={shop} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
