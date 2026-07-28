import { useContext } from "react";
import { FavouritesContext } from "../context/favourites.context";

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) {
    throw new Error("useFavourites must be used within FavouritesProvider");
  }
  return ctx;
}
