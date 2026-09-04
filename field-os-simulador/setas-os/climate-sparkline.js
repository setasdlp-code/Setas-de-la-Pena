// SVG sparkline renderer for the .dc camera dashboard.
// The .dc HTML stays valid before React mounts: dynamic SVG attributes are
// passed as normal x-import props rather than parsed from raw moustache values.
(function attachSetasClimateSparkline(root) {
  const NUMBER = "-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)";
  const POINTS_PATTERN = new RegExp(`^\\s*${NUMBER}\\s*,\\s*${NUMBER}(?:\\s+${NUMBER}\\s*,\\s*${NUMBER})*\\s*$`);

  function safePolyline(value) {
    const points = String(value ?? "").trim();
    return POINTS_PATTERN.test(points) ? points : "";
  }

  function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function sparkPointLabel(point) {
    return `Hace ${finiteNumber(point?.hoursAgo, 0)} h — ${finiteNumber(point?.temp, 0)}°C · ${finiteNumber(point?.hum, 0)}% HR · ${finiteNumber(point?.co2, 0)} ppm CO₂`;
  }

  function SetasClimateSparkline({
    tempPoints,
    humPoints,
    co2Points,
    tempEndY,
    humEndY,
    co2EndY,
    sparkPoints,
    trendLabel,
    chartHeight = 56,
    marginTop = 0,
  }) {
    const React = root.React;
    if (!React) throw new Error("SetasClimateSparkline requiere React antes del montaje .dc");
    const h = React.createElement;
    const height = Math.max(20, Math.min(120, finiteNumber(chartHeight, 56)));
    const points = Array.isArray(sparkPoints) ? sparkPoints : [];

    return h(
      "svg",
      {
        viewBox: "0 0 280 56",
        preserveAspectRatio: "none",
        role: "img",
        "aria-label": trendLabel || "Tendencia de temperatura, humedad y CO₂",
        style: { width: "100%", height: `${height}px`, overflow: "visible", marginTop: `${finiteNumber(marginTop, 0)}px` },
      },
      h("polyline", { points: safePolyline(tempPoints), fill: "none", stroke: "var(--accent-terracotta)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
      h("polyline", { points: safePolyline(humPoints), fill: "none", stroke: "var(--accent-blue-grey)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
      h("polyline", { points: safePolyline(co2Points), fill: "none", stroke: "var(--accent-olive)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }),
      h("circle", { cx: 280, cy: finiteNumber(tempEndY, 56), r: 4, fill: "var(--accent-terracotta)", stroke: "var(--paper-0)", strokeWidth: "2" }),
      h("circle", { cx: 280, cy: finiteNumber(humEndY, 56), r: 4, fill: "var(--accent-blue-grey)", stroke: "var(--paper-0)", strokeWidth: "2" }),
      h("circle", { cx: 280, cy: finiteNumber(co2EndY, 56), r: 4, fill: "var(--accent-olive)", stroke: "var(--paper-0)", strokeWidth: "2" }),
      ...points.map((point, index) => h(
        "rect",
        { key: `sample-${index}`, x: finiteNumber(point?.xStart, 0), y: 0, width: 20, height: 56, fill: "transparent", style: { cursor: "crosshair" } },
        h("title", null, sparkPointLabel(point)),
      )),
    );
  }

  const api = { SetasClimateSparkline, safePolyline, finiteNumber, sparkPointLabel };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.SetasClimateSparkline = SetasClimateSparkline;
})(typeof window === "undefined" ? globalThis : window);
