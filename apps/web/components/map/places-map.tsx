"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  getDataSource,
  getDataSourceShortName,
  type MapOverlay,
} from "@bible-visualizer/bible-data";
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

const STUB_COLOR = "#94a3b8";

function pinIcon(color: string, prominence: string | null, name: string): L.DivIcon {
  const isMajor = prominence === "major";
  const isNotable = prominence === "notable";
  const isMinor = prominence === "minor";
  const size = isMajor ? 16 : isMinor ? 9 : 12;
  const border = isMinor ? "1px solid rgba(255,255,255,0.7)" : "2px solid white";
  const opacity = isMinor ? 0.65 : 1;
  const showLabel = isMajor || isNotable || !prominence;
  const labelFontSize = isMajor ? 11 : 10;
  const labelWeight = isMajor ? 600 : 500;
  const dot = `<span style="
    position:absolute;left:0;top:0;
    width:${size}px;height:${size}px;
    background:${color};
    border-radius:50%;
    border:${border};
    box-shadow:0 0 0 1px rgba(0,0,0,0.45),0 1px 3px rgba(0,0,0,0.3);
    opacity:${opacity};
  "></span>`;
  const label = showLabel
    ? `<span style="
        position:absolute;
        left:${size + 4}px;
        top:50%;
        transform:translateY(-50%);
        font-size:${labelFontSize}px;
        font-weight:${labelWeight};
        line-height:1;
        color:#0f172a;
        white-space:nowrap;
        pointer-events:none;
        text-shadow:
          0 0 3px #fff,
          0 0 3px #fff,
          0 0 2px #fff,
          0 0 2px #fff;
      ">${escapeHtml(name)}</span>`
    : "";
  return L.divIcon({
    className: "place-marker",
    html: `<div style="position:relative;width:${size}px;height:${size}px;">${dot}${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 1)],
  });
}

function tooltipHtml(p: PlaceSummary): string {
  const subtitle = p.modernEquivalent ?? p.region ?? null;
  return `
    <div style="font-family:inherit;line-height:1.25;">
      <div style="font-weight:600;font-size:11px;color:#0f172a;">${escapeHtml(p.name)}</div>
      ${subtitle ? `<div style="font-size:10px;color:#64748b;margin-top:1px;">${escapeHtml(subtitle)}</div>` : ""}
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default: return "&#39;";
    }
  });
}

function popupHtml(p: PlaceSummary): string {
  const sourceMeta = p.source ? getDataSource(p.source) : null;
  const sourceName = getDataSourceShortName(p.source) ?? p.source ?? "";
  return `
    <div style="font-family:inherit;min-width:160px;">
      <div style="display:flex;align-items:flex-start;gap:6px;justify-content:space-between;">
        <div style="font-size:13px;font-weight:600;color:#0f172a;">${escapeHtml(p.name)}</div>
        ${
          p.isStub
            ? '<span style="flex-shrink:0;border-radius:3px;background:#e2e8f0;padding:1px 5px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#64748b;">stub</span>'
            : ""
        }
      </div>
      ${p.region ? `<div style="margin-top:2px;font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;">${escapeHtml(p.region)}</div>` : ""}
      ${p.modernEquivalent ? `<div style="margin-top:4px;font-size:11px;color:#475569;">${escapeHtml(p.modernEquivalent)}</div>` : ""}
      ${
        p.description
          ? `<div style="margin-top:4px;font-size:11px;color:#475569;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(p.description)}</div>`
          : ""
      }
      ${
        p.source
          ? `<div style="margin-top:6px;font-size:10px;color:#64748b;">Coords from <a href="${escapeHtml(p.sourceUrl ?? sourceMeta?.url ?? "#")}" target="_blank" rel="noreferrer" style="color:inherit;text-decoration:underline;">${escapeHtml(sourceName)}</a></div>`
          : ""
      }
      <a href="/places/${escapeHtml(p.code)}" style="display:inline-block;margin-top:6px;font-size:11px;font-weight:500;color:#7c3aed;text-decoration:underline;">View details →</a>
    </div>
  `;
}

interface ClusterLayerProps {
  places: PlaceSummary[];
  fitKey: string;
}

function ClusterLayer({ places, fitKey }: ClusterLayerProps) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const lastFitRef = useRef<string | null>(null);

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 48,
      disableClusteringAtZoom: 10,
      chunkedLoading: true,
    });
    clusterRef.current = cluster;
    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    cluster.clearLayers();
    const markers: L.Marker[] = [];
    const positions: L.LatLngExpression[] = [];
    for (const p of places) {
      if (p.latitude === null || p.longitude === null) continue;
      const color = (p.region && REGION_COLORS[p.region]) ?? STUB_COLOR;
      const marker = L.marker([p.latitude, p.longitude], {
        icon: pinIcon(color, p.prominence, p.name),
      });
      marker.bindTooltip(tooltipHtml(p), {
        direction: "top",
        offset: [0, -6],
        opacity: 0.95,
        className: "place-tooltip",
      });
      marker.bindPopup(popupHtml(p), { maxWidth: 260, closeButton: true });
      markers.push(marker);
      positions.push([p.latitude, p.longitude]);
    }
    cluster.addLayers(markers);

    if (positions.length > 0 && lastFitRef.current !== fitKey) {
      lastFitRef.current = fitKey;
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 8,
        animate: true,
        duration: 0.4,
      });
    }
  }, [places, map, fitKey]);

  return null;
}

interface OverlayLayerProps {
  overlays: MapOverlay[];
}

function OverlayLayer({ overlays }: OverlayLayerProps) {
  const map = useMap();
  const groupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const group = L.layerGroup();
    groupRef.current = group;
    group.addTo(map);
    return () => {
      group.removeFrom(map);
      groupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    for (const overlay of overlays) {
      if (!overlay.geometry) continue;
      const fillOpacity = overlay.kind === "empire" ? 0.04 : 0.09;
      const dashArray = overlay.kind === "empire" ? "4 4" : undefined;
      const layer = L.geoJSON(overlay.geometry, {
        style: {
          color: overlay.color,
          weight: 1.5,
          opacity: 0.85,
          fillColor: overlay.color,
          fillOpacity,
          dashArray,
          interactive: true,
        },
      });
      layer.bindTooltip(overlayTooltipHtml(overlay), {
        sticky: true,
        direction: "top",
        opacity: 0.95,
        className: "place-tooltip",
      });
      layer.addTo(group);
    }
    return () => {
      group.clearLayers();
    };
  }, [overlays]);

  return null;
}

function overlayTooltipHtml(o: MapOverlay): string {
  const sourceName = getDataSourceShortName(o.source) ?? o.source;
  return `
    <div style="font-family:inherit;line-height:1.3;max-width:240px;">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:6px;">
        <span style="font-weight:600;font-size:11px;color:#0f172a;">${escapeHtml(o.name)}</span>
        <span style="font-size:9px;text-transform:uppercase;letter-spacing:0.06em;color:${o.color};">${escapeHtml(o.kind)}</span>
      </div>
      ${o.description ? `<div style="font-size:10px;color:#475569;margin-top:3px;white-space:normal;">${escapeHtml(o.description)}</div>` : ""}
      <div style="font-size:9px;color:#94a3b8;margin-top:4px;">via ${escapeHtml(sourceName)} · approximate</div>
    </div>
  `;
}

interface PlacesMapProps {
  places: PlaceSummary[];
  overlays: MapOverlay[];
  activeRegion: string | null;
  fitKey?: string;
}

export function PlacesMap({ places, overlays, activeRegion, fitKey }: PlacesMapProps) {
  const visible = useMemo(
    () => places.filter((p) => p.latitude !== null && p.longitude !== null),
    [places],
  );

  const computedFitKey = fitKey ?? `${activeRegion ?? "all"}:${visible.length}`;

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
        <OverlayLayer overlays={overlays} />
        <ClusterLayer places={visible} fitKey={computedFitKey} />
      </MapContainer>
    </div>
  );
}
