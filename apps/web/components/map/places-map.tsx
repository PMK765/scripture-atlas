"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { PlaceSummary } from "@/lib/place-queries";
import { cn } from "@/lib/utils";

const REGION_COLORS: Record<string, string> = {
  judah: "#a78bfa",
  galilee: "#34d399",
  samaria: "#fbbf24",
  ephraim: "#fbbf24",
  negev: "#f87171",
  sinai: "#fb923c",
  egypt: "#facc15",
  mesopotamia: "#60a5fa",
  aram: "#22d3ee",
  phoenicia: "#06b6d4",
  philistia: "#f472b6",
  edom: "#f87171",
  moab: "#fb7185",
  ammon: "#fda4af",
  greece: "#a3e635",
  italy: "#84cc16",
  "asia-minor": "#10b981",
  syria: "#22d3ee",
};

function pinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "place-marker",
    html: `<span style="
      display:inline-block;
      width:14px;height:14px;
      background:${color};
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 0 0 1px rgba(0,0,0,0.5),0 1px 4px rgba(0,0,0,0.4);
    "></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -6],
  });
}

interface FitToMarkersProps {
  positions: Array<[number, number]>;
}

function FitToMarkers({ positions }: FitToMarkersProps) {
  const map = useMap();
  const fittedRef = useRef(false);
  useEffect(() => {
    if (fittedRef.current) return;
    if (positions.length === 0) return;
    fittedRef.current = true;
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, positions]);
  return null;
}

interface PlacesMapProps {
  places: PlaceSummary[];
  activeRegion: string | null;
}

export function PlacesMap({ places, activeRegion }: PlacesMapProps) {
  const visible = useMemo(
    () =>
      places.filter(
        (p) =>
          p.latitude !== null &&
          p.longitude !== null &&
          (!activeRegion || p.region === activeRegion),
      ),
    [places, activeRegion],
  );

  const positions = useMemo<Array<[number, number]>>(
    () =>
      visible
        .filter((p) => p.latitude !== null && p.longitude !== null)
        .map((p) => [p.latitude as number, p.longitude as number]),
    [visible],
  );

  return (
    <div className={cn("h-[600px] overflow-hidden rounded-lg border")}>
      <MapContainer
        center={[31.7784, 35.2353]}
        zoom={6}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToMarkers positions={positions} />
        {visible.map((p) => {
          const color = (p.region && REGION_COLORS[p.region]) ?? "#94a3b8";
          return (
            <Marker
              key={p.code}
              position={[p.latitude as number, p.longitude as number]}
              icon={pinIcon(color)}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{p.name}</p>
                  {p.region ? (
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {p.region}
                    </p>
                  ) : null}
                  {p.modernEquivalent ? (
                    <p className="text-xs text-muted-foreground">{p.modernEquivalent}</p>
                  ) : null}
                  {p.description ? (
                    <p className="line-clamp-3 text-xs text-muted-foreground">{p.description}</p>
                  ) : null}
                  <Link
                    href={`/places/${p.code}`}
                    className="inline-block pt-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    View details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
