"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

type FeatureProperties = {
  id?: string | number;
  LABEL?: string;
  name?: string;
  tree_count?: number | string;
  priority_score?: number;
  population_2020?: number | string;
  median_income?: number | string;
  canopy_pct?: number | string;
  heat_index?: number | string;
};

type GeoJsonFeature = {
  type: string;
  properties?: FeatureProperties;
  geometry?: unknown;
};

type GeoJsonData = {
  type: string;
  features?: GeoJsonFeature[];
};

function formatNumber(value: number | string | undefined) {
  const parsed = Number(value);
  if (value == null || Number.isNaN(parsed)) return "N/A";
  return parsed.toLocaleString();
}

function formatDecimal(value: number | string | undefined, digits = 2) {
  const parsed = Number(value);
  if (value == null || Number.isNaN(parsed)) return "N/A";
  return parsed.toFixed(digits);
}

function quantile(values: number[], q: number) {
  if (!values.length) return 0;
  const pos = (values.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (values[base + 1] !== undefined) {
    return values[base] + rest * (values[base + 1] - values[base]);
  }

  return values[base];
}

export default function Map() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<GeoJsonFeature | null>(null);
  const selectedRef = useRef<GeoJsonFeature | null>(null);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    let map: any;
    let geoJsonLayer: any;

    async function initMap() {
      if (!mapRef.current) return;

      const L = (await import("leaflet")).default;

      map = L.map(mapRef.current, {
        zoomControl: true,
      }).setView([34.05, -118.25], 9);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(map);

      const res = await fetch("/areas.geojson");
      const data: GeoJsonData = await res.json();
      const features = data.features ?? [];

      const treeCounts = features
        .map((feature) => Number(feature?.properties?.tree_count))
        .filter((value) => !Number.isNaN(value))
        .sort((a, b) => a - b);

      const q20 = quantile(treeCounts, 0.2);
      const q40 = quantile(treeCounts, 0.4);
      const q60 = quantile(treeCounts, 0.6);
      const q80 = quantile(treeCounts, 0.8);

      function getTreeCategory(value: number) {
        if (Number.isNaN(value)) return "No Data";
        if (value <= q20) return "Very Low";
        if (value <= q40) return "Low";
        if (value <= q60) return "Moderate";
        if (value <= q80) return "High";
        return "Very High";
      }

      function getTreeColor(value: number) {
        const category = getTreeCategory(value);

        switch (category) {
          case "Very Low":
            return "#2166ac";
          case "Low":
            return "#67a9cf";
          case "Moderate":
            return "#f7f7f7";
          case "High":
            return "#ef8a62";
          case "Very High":
            return "#b2182b";
          default:
            return "transparent";
        }
      }

      function getFeatureId(properties: FeatureProperties | undefined) {
        return properties?.id ?? properties?.LABEL ?? properties?.name ?? "";
      }

      function getDefaultStyle(
        feature: GeoJsonFeature | undefined,
        selectedFeature?: GeoJsonFeature | null
      ) {
        const properties = feature?.properties ?? {};
        const treeCount = Number(properties.tree_count);
        const selectedId = getFeatureId(selectedFeature?.properties);
        const featureId = getFeatureId(properties);
        const isSelected = String(featureId) === String(selectedId);

        return {
          stroke: true,
          color: isSelected ? "#111111" : "#ffffff",
          weight: isSelected ? 3 : 1,
          fill: true,
          fillColor: getTreeColor(treeCount),
          fillOpacity: 0.35,
        };
      }

      geoJsonLayer = L.geoJSON(data, {
        style: (feature: GeoJsonFeature) => getDefaultStyle(feature, selected),
        onEachFeature: (feature: GeoJsonFeature, layer: any) => {
          const properties = feature?.properties ?? {};
          const treeCount = Number(properties.tree_count);

          layer.on("add", () => {
            const path = layer?._path;
            if (path) {
              path.setAttribute("tabindex", "-1");
              path.style.outline = "none";
              path.style.boxShadow = "none";
            }
          });

          layer.bindTooltip(
            `
              <div style="min-width: 220px;">
                <div><strong>Area:</strong> ${properties.name ?? properties.LABEL ?? "N/A"}</div>
                <div><strong>Trees:</strong> ${formatNumber(properties.tree_count)}</div>
                <div><strong>Category:</strong> ${getTreeCategory(treeCount)}</div>
              </div>
            `,
            {
              sticky: true,
              direction: "top",
              opacity: 0.95,
            }
          );

          layer.on({
            click: () => {
              setSelected(feature);
              geoJsonLayer.setStyle((candidate: GeoJsonFeature) =>
                getDefaultStyle(candidate, feature)
              );
            },
            mouseover: (event: any) => {
              event.target.setStyle({
                weight: 2,
                color: "#ffff00",
                fillOpacity: 0.55,
              });
            },
            mouseout: (event: any) => {
              geoJsonLayer.resetStyle(event.target);
              geoJsonLayer.setStyle((candidate: GeoJsonFeature) =>
                getDefaultStyle(candidate, selectedRef.current)
              );
            },
          });
        },
      });

      geoJsonLayer.addTo(map);

      if (geoJsonLayer.getBounds()?.isValid?.()) {
        map.fitBounds(geoJsonLayer.getBounds());
      }

      const legend = new L.Control({ position: "topright" });

      legend.onAdd = function () {
        const div = L.DomUtil.create("div", "info legend");
        div.style.background = "white";
        div.style.padding = "10px 12px";
        div.style.borderRadius = "8px";
        div.style.boxShadow = "0 1px 5px rgba(0,0,0,0.3)";
        div.style.lineHeight = "22px";

        const items = [
          ["#2166ac", "Very Low"],
          ["#67a9cf", "Low"],
          ["#f7f7f7", "Moderate"],
          ["#ef8a62", "High"],
          ["#b2182b", "Very High"],
        ];

        div.innerHTML = items
          .map(
            ([color, label]) => `
              <div style="display:flex;align-items:center;gap:10px;">
                <span
                  style="
                    width:16px;
                    height:16px;
                    border-radius:50%;
                    display:inline-block;
                    background:${color};
                    border:1px solid #ccc;
                  "
                ></span>
                <span>${label}</span>
              </div>
            `
          )
          .join("");

        return div;
      };

      legend.addTo(map);
    }

    initMap();

    return () => {
      if (map) map.remove();
    };
  }, []);

  const properties = selected?.properties ?? {};
  const treeCount = Number(properties.tree_count);
  const category = Number.isNaN(treeCount)
    ? "No Data"
    : treeCount <= 0
    ? "Very Low"
    : "Selected";

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh" }}>
      <div
        style={{
          width: "420px",
          background: "#f7f9fa",
          borderRight: "1px solid #d9d9d9",
          overflowY: "auto",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#222",
        }}
      >
        <div
          style={{
            background: "#2db7ad",
            color: "white",
            padding: "26px 22px",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          Tree OS
        </div>

        <div style={{ padding: "24px 22px" }}>
          {!selected ? (
            <div style={{ fontSize: "16px", color: "#555" }}>
              Click an area on the map to see details.
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  marginBottom: "26px",
                  color: "#111",
                }}
              >
                {properties.name ?? properties.LABEL ?? "N/A"}
              </div>

              <div style={{ marginBottom: "30px" }}>
                <div
                  style={{
                    color: "#1a8f88",
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "12px",
                  }}
                >
                  Priority & Impact
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    padding: "16px",
                    border: "1px solid #eee",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <span style={{ color: "#555", fontWeight: 500 }}>
                      Priority Score
                    </span>
                    <strong style={{ color: "#111", fontWeight: 600 }}>
                      {formatDecimal(properties.priority_score)}
                    </strong>
                  </div>

                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#555", fontWeight: 500 }}>
                      Tree Category
                    </span>
                    <strong style={{ color: "#111", fontWeight: 600 }}>
                      {category}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "30px" }}>
                <div
                  style={{
                    color: "#1a8f88",
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "12px",
                  }}
                >
                  Community Overview
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    padding: "16px",
                    border: "1px solid #eee",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <span style={{ color: "#555", fontWeight: 500 }}>
                      Population
                    </span>
                    <strong style={{ color: "#111", fontWeight: 600 }}>
                      {formatNumber(properties.population_2020)}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <span style={{ color: "#555", fontWeight: 500 }}>
                      Median Income
                    </span>
                    <strong style={{ color: "#111", fontWeight: 600 }}>
                      {formatNumber(properties.median_income)}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <span style={{ color: "#555", fontWeight: 500 }}>
                      Tree Count
                    </span>
                    <strong style={{ color: "#111", fontWeight: 600 }}>
                      {formatNumber(properties.tree_count)}
                    </strong>
                  </div>

                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#555", fontWeight: 500 }}>
                      Canopy %
                    </span>
                    <strong style={{ color: "#111", fontWeight: 600 }}>
                      {formatDecimal(properties.canopy_pct)}
                    </strong>
                  </div>
                </div>
              </div>

              <div>
                <div
                  style={{
                    color: "#1a8f88",
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "12px",
                  }}
                >
                  Environmental Signals
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    padding: "16px",
                    border: "1px solid #eee",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <span style={{ color: "#555", fontWeight: 500 }}>
                      Heat Index
                    </span>
                    <strong style={{ color: "#111", fontWeight: 600 }}>
                      {formatDecimal(properties.heat_index)}
                    </strong>
                  </div>

                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#555", fontWeight: 500 }}>
                      Selected Area
                    </span>
                    <strong style={{ color: "#111", fontWeight: 600 }}>
                      {properties.name ?? properties.LABEL ?? "N/A"}
                    </strong>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <div
          ref={mapRef}
          style={{
            width: "100%",
            height: "100%",
            minHeight: "100vh",
          }}
        />
      </div>
    </div>
  );
}
