"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function Map() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<any>(null);

  function formatNumber(x: number | undefined) {
    if (x == null || Number.isNaN(x)) return "N/A";
    return Number(x).toLocaleString();
  }

  useEffect(() => {
    let map: any;
    let geoJsonLayer: any;

    async function initMap() {
      if (!mapRef.current) return;

      const L = (await import("leaflet")).default;

      map = L.map(mapRef.current, {
        zoomControl: true,
      }).setView([34.05, -118.25], 9);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      const res = await fetch("/areas.geojson");
      const data = await res.json();

      const features = data.features ?? [];

      const treeCounts = features
        .map((f: any) => Number(f?.properties?.tree_count))
        .filter((v: number) => !Number.isNaN(v))
        .sort((a: number, b: number) => a - b);

      function quantile(arr: number[], q: number) {
        if (!arr.length) return 0;
        const pos = (arr.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (arr[base + 1] !== undefined) {
          return arr[base] + rest * (arr[base + 1] - arr[base]);
        }
        return arr[base];
      }

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

      function getFeatureId(p: any) {
        return p?.id ?? p?.LABEL ?? p?.name;
      }

      function getDefaultStyle(feature: any, selectedFeature?: any) {
      const p = feature?.properties ?? {};
      const treeCount = Number(p.tree_count);

      const selectedId = getFeatureId(selectedFeature?.properties ?? {});
      const featureId = getFeatureId(p);

      return {
        stroke: true,
        color: String(featureId) === String(selectedId) ? "#111111" : "#ffffff",
        weight: String(featureId) === String(selectedId) ? 3 : 1,
        fill: true,
        fillColor: getTreeColor(treeCount),
        fillOpacity: 0.35,
      };
    }

      geoJsonLayer = L.geoJSON(data, {
        style: (feature: any) => getDefaultStyle(feature, null),

        onEachFeature: (feature: any, layer: any) => {
          const p = feature?.properties ?? {};
          const treeCount = Number(p.tree_count);

          layer.on("add", () => {
            const path = (layer as any)._path;
            if (path) {
              path.setAttribute("tabindex", "-1");
              path.style.outline = "none";
              path.style.boxShadow = "none";
            }
          });

          layer.bindTooltip(
            `
            <div style="min-width: 220px;">
              <div><strong>Area:</strong> ${p.name ?? p.LABEL ?? "N/A"}</div>
              <div><strong>Trees:</strong> ${p.tree_count ?? "N/A"}</div>
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

              geoJsonLayer.setStyle((f: any) => getDefaultStyle(f, feature));
            },
            mouseover: (e: any) => {
              e.target.setStyle({
                weight: 2,
                color: "#ffff00",
                fillOpacity: 0.55,
              });
            },
            mouseout: (e: any) => {
              geoJsonLayer.resetStyle(e.target);
            },
          });
        },
      });

      geoJsonLayer.addTo(map);
      map.fitBounds(geoJsonLayer.getBounds());

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
            ([color, label]) =>
              `<div style="display:flex;align-items:center;gap:10px;">
                <span style="
                  width:16px;
                  height:16px;
                  border-radius:50%;
                  display:inline-block;
                  background:${color};
                  border:1px solid #ccc;
                "></span>
                <span>${label}</span>
              </div>`
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

  const p = selected?.properties ?? {};

  function getPanelCategory() {
    const treeCount = Number(p.tree_count);
    if (Number.isNaN(treeCount)) return "No Data";
    return treeCount <= 0
      ? "Very Low"
      : p.tree_count != null
      ? "Selected"
      : "No Data";
  }
  return (
  <div style={{ display: "flex", width: "100%", height: "100vh" }}>

   {/* ✅ SIDEBAR */}
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
  {/* HEADER */}
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
        {/* AREA NAME */}
        <div
          style={{
            fontSize: "22px",
            fontWeight: 700,
            marginBottom: "26px",
            color: "#111",
          }}
        >
          {p.name ?? p.LABEL ?? "N/A"}
        </div>

        {/* PRIORITY */}
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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#555", fontWeight: 500 }}>
                Priority Score
              </span>
              <strong style={{ color: "#111", fontWeight: 600 }}>
                {p.priority_score?.toFixed?.(2) ?? "N/A"}
              </strong>
            </div>
          </div>
        </div>

        {/* COMMUNITY */}
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
                {formatNumber(p.population_2020)}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#555", fontWeight: 500 }}>
                Poverty Rate
              </span>
              <strong style={{ color: "#111", fontWeight: 600 }}>
                {p.poverty_rate_2020 != null
                  ? `${Number(p.poverty_rate_2020).toFixed(1)}%`
                  : "N/A"}
              </strong>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
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
            Summary
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "16px",
              border: "1px solid #eee",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#555", fontWeight: 500 }}>
                Category
              </span>
              <strong style={{ color: "#111", fontWeight: 600 }}>
                {getPanelCategory()}
              </strong>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
</div>

    {/* ✅ MAP */}
    <div
      ref={mapRef}
      tabIndex={-1}
      style={{ flex: 1, height: "100%", outline: "none" }}
    />
    
  </div>
);
}