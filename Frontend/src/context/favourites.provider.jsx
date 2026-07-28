import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { FavouritesContext } from "./favourites.context";
import api from "../api/axios";
import toast from "react-hot-toast";

function isCustomerToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    return jwtDecode(token)?.role === "customer";
  } catch {
    return false;
  }
}

export const FavouritesProvider = ({ children }) => {
  const [shopIds, setShopIds] = useState([]);
  const [productIds, setProductIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const clearFavourites = useCallback(() => {
    setShopIds([]);
    setProductIds([]);
  }, []);

  const fetchIds = useCallback(async () => {
    if (!isCustomerToken()) {
      clearFavourites();
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/favourites/ids");
      setShopIds(res.data.shopIds || []);
      setProductIds(res.data.productIds || []);
    } catch (error) {
      console.error("Error fetching favourites:", error);
    } finally {
      setLoading(false);
    }
  }, [clearFavourites]);

  const isFavourited = useCallback(
    (type, id) => {
      if (!id) return false;
      const key = id.toString();
      return type === "shop"
        ? shopIds.includes(key)
        : productIds.includes(key);
    },
    [shopIds, productIds]
  );

  const toggleFavourite = useCallback(
    async (type, id) => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to save favourites");
        return { requiresAuth: true };
      }

      try {
        const role = jwtDecode(token)?.role;
        if (role !== "customer") {
          toast.error("Only customers can save favourites");
          return { forbidden: true };
        }
      } catch {
        toast.error("Please login to save favourites");
        return { requiresAuth: true };
      }

      const key = id.toString();
      const currentlyFavourited = isFavourited(type, key);

      // Optimistic update
      if (type === "shop") {
        setShopIds((prev) =>
          currentlyFavourited
            ? prev.filter((x) => x !== key)
            : [...prev, key]
        );
      } else {
        setProductIds((prev) =>
          currentlyFavourited
            ? prev.filter((x) => x !== key)
            : [...prev, key]
        );
      }

      try {
        const res = await api.post("/favourites/toggle", { type, id: key });
        const favourited = res.data.favourited;

        if (type === "shop") {
          setShopIds((prev) => {
            const without = prev.filter((x) => x !== key);
            return favourited ? [...without, key] : without;
          });
        } else {
          setProductIds((prev) => {
            const without = prev.filter((x) => x !== key);
            return favourited ? [...without, key] : without;
          });
        }

        toast.success(
          favourited ? "Added to favourites" : "Removed from favourites"
        );
        return { favourited };
      } catch (error) {
        // Revert optimistic update
        if (type === "shop") {
          setShopIds((prev) =>
            currentlyFavourited
              ? [...prev.filter((x) => x !== key), key]
              : prev.filter((x) => x !== key)
          );
        } else {
          setProductIds((prev) =>
            currentlyFavourited
              ? [...prev.filter((x) => x !== key), key]
              : prev.filter((x) => x !== key)
          );
        }

        toast.error(
          error.response?.data?.message || "Failed to update favourite"
        );
        return { error: true };
      }
    },
    [isFavourited]
  );

  useEffect(() => {
    fetchIds();

    const handleAuthChange = () => fetchIds();
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, [fetchIds]);

  return (
    <FavouritesContext.Provider
      value={{
        shopIds,
        productIds,
        loading,
        isFavourited,
        toggleFavourite,
        refreshFavourites: fetchIds,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
};
