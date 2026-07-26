import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFavourites } from "../hooks/useFavourites";

/**
 * Shared favourite heart for shops and products.
 * @param {"shop"|"product"} type
 * @param {string} itemId
 */
function FavouriteButton({ type, itemId, className = "", size = "md" }) {
  const navigate = useNavigate();
  const { isFavourited, toggleFavourite } = useFavourites();
  const [busy, setBusy] = useState(false);

  const active = isFavourited(type, itemId);

  const sizeClass =
    size === "sm" ? "w-8 h-8" : size === "lg" ? "w-11 h-11" : "w-10 h-10";
  const iconClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy || !itemId) return;

    setBusy(true);
    try {
      const result = await toggleFavourite(type, itemId);
      if (result?.requiresAuth) {
        navigate("/login");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={active ? "Remove from favourites" : "Add to favourites"}
      aria-pressed={active}
      disabled={busy}
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-full shadow-md transition disabled:opacity-60 ${sizeClass} ${
        active
          ? "bg-rose-500 text-white hover:bg-rose-600"
          : "bg-white/95 text-gray-500 hover:text-rose-500 hover:bg-white"
      } ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className={iconClass}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}

export default FavouriteButton;
