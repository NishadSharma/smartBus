const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

async function handle(res, label) {
  if (!res.ok) throw new Error(`${label} failed: ${res.status}`);
  return res.json();
}

export async function getBusEta(busId) {
  const res = await fetch(`/api/bus/${encodeURIComponent(busId)}/eta`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch ETA");
  }
  return res.json();
}

export function getLiveBuses() {
  return fetch(`${API_BASE}/api/buses/live`).then((r) => handle(r, "buses/live"));
}

export function getRoutes() {
  return fetch(`${API_BASE}/api/routes`).then((r) => handle(r, "routes"));
}

export function getStops(routeId) {
  return fetch(`${API_BASE}/api/routes/${routeId}/stops`).then((r) => handle(r, "stops"));
}

export function getBusLatest(busId) {
  return fetch(`${API_BASE}/api/bus/${busId}/latest`).then((r) => handle(r, "bus/latest"));
}

// export function getBusEta(busId) {
//   return fetch(`${API_BASE}/api/bus/${busId}/eta`).then((r) => handle(r, "bus/eta"));
// }
