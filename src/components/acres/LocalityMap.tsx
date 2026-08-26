"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Property } from "./mock-data";

const categoryLabels: Record<string, string> = {
  schools: "School",
  colleges: "College",
  hospitals: "Hospital",
  shopping: "Shopping",
  metro: "Metro / Train",
  workplaces: "Workplace",
  parks: "Park",
  roads: "Road / Connectivity",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}

export default function LocalityMap({ property }: { property: Property }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const latitude = property.locality?.latitude;
  const longitude = property.locality?.longitude;

  useEffect(() => {
    if (!containerRef.current || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const propertyLatitude = latitude as number;
    const propertyLongitude = longitude as number;
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([propertyLatitude, propertyLongitude], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const propertyIcon = L.divIcon({
      className: "",
      html: '<span style="display:block;width:22px;height:22px;border-radius:50%;background:#DDAA42;border:4px solid #172039;box-shadow:0 2px 9px rgba(0,0,0,.3)"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    L.marker([propertyLatitude, propertyLongitude], { icon: propertyIcon })
      .addTo(map)
      .bindPopup(`<strong>${escapeHtml(property.title)}</strong><br>${escapeHtml(property.locality?.address || property.subtitle || "Property location")}`);

    const bounds: L.LatLngExpression[] = [[propertyLatitude, propertyLongitude]];
    for (const [category, detail] of Object.entries(property.nearbyDetails || {})) {
      for (const place of detail?.places || []) {
        if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) continue;
        const placeLatitude = place.latitude as number;
        const placeLongitude = place.longitude as number;
        bounds.push([placeLatitude, placeLongitude]);
        const markerIcon = L.divIcon({
          className: "",
          html: '<span style="display:block;width:18px;height:18px;border-radius:50% 50% 50% 0;background:#D84444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);transform:rotate(-45deg)"></span>',
          iconSize: [18, 18],
          iconAnchor: [9, 18],
        });
        const mapUrl = place.mapUrl || `https://www.google.com/maps/search/?api=1&query=${placeLatitude},${placeLongitude}`;
        const detailText = [place.distance, place.landmark].filter(Boolean).join(" · ");
        L.marker([placeLatitude, placeLongitude], { icon: markerIcon })
          .addTo(map)
          .bindPopup(`<span style="font-size:11px;color:#7A8290">${escapeHtml(categoryLabels[category] || category)}</span><br><strong>${escapeHtml(place.name)}</strong>${detailText ? `<br>${escapeHtml(detailText)}` : ""}<br><a href="${escapeHtml(mapUrl)}" target="_blank" rel="noreferrer">Open in Google Maps</a>`);
      }
    }
    if (bounds.length > 1) map.fitBounds(L.latLngBounds(bounds), { padding: [32, 32], maxZoom: 15 });
    window.setTimeout(() => map.invalidateSize(), 0);
    return () => {
      map.remove();
    };
  }, [latitude, longitude, property]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return <div ref={containerRef} className="h-[360px] w-full overflow-hidden rounded-2xl border border-[#E4E0E7]/50 bg-[#EEF1F4]" aria-label={`${property.title} interactive locality map`} />;
}
