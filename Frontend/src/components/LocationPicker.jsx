import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;
const PINNED_ZOOM = 14;

function LocationPicker({ latitude = null, longitude = null, onChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const placeMarker = (map, lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current.getLatLng();
        onChangeRef.current?.({
          latitude: pos.lat,
          longitude: pos.lng,
        });
      });
    }
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const hasPin = Number.isFinite(latitude) && Number.isFinite(longitude);
    const map = L.map(containerRef.current).setView(
      hasPin ? [latitude, longitude] : DEFAULT_CENTER,
      hasPin ? PINNED_ZOOM : DEFAULT_ZOOM
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    if (hasPin) {
      placeMarker(map, latitude, longitude);
    }

    map.on("click", (e) => {
      placeMarker(map, e.latlng.lat, e.latlng.lng);
      onChangeRef.current?.({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
    });

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      return;
    }

    placeMarker(map, latitude, longitude);
  }, [latitude, longitude]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onChange?.({ latitude: lat, longitude: lng });
        mapRef.current?.setView([lat, lng], PINNED_ZOOM);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const hasLocation =
    Number.isFinite(latitude) && Number.isFinite(longitude);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <p className="text-sm font-medium text-gray-700">Shop location</p>
          <p className="text-xs text-gray-500">
            Click the map to drop a pin (used for nearby search)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          >
            Use my location
          </button>
          {hasLocation && (
            <button
              type="button"
              onClick={() => onChange?.(null)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-red-600"
            >
              Clear pin
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="h-56 w-full rounded-xl overflow-hidden border border-gray-200 z-0"
      />

      <p className="text-xs text-gray-500 mt-2">
        {hasLocation
          ? `Location set · ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
          : "No pin set yet — shop won’t appear in nearby results until you add one."}
      </p>
    </div>
  );
}

export default LocationPicker;
