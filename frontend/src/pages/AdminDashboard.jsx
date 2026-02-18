import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import GovHeader from "../components/GovHeader";
import {
  listRoutes,
  createRoute,
  deleteRoute,
  listStops,
  createStop,
  updateStop,
  deleteStop,
} from "../api";

export default function AdminDashboard() {
  const [routes, setRoutes] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [error, setError] = useState("");

  // new route form
  const [newRouteId, setNewRouteId] = useState("");
  const [newRouteName, setNewRouteName] = useState("");

  // new stop form
  const [newStop, setNewStop] = useState({
    stopId: "",
    name_en: "",
    lat: "",
    lng: "",
    sequence: "",
  });

  async function refreshRoutes() {
    try {
      setError("");
      setRoutesLoading(true);
      const data = await listRoutes();
      setRoutes(data);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setRoutesLoading(false);
    }
  }

  useEffect(() => {
    refreshRoutes();
  }, []);

  useEffect(() => {
    if (!selectedRoute) {
      setStops([]);
      return;
    }
    (async () => {
      try {
        setStopsLoading(true);
        const s = await listStops(selectedRoute.routeId);
        setStops(Array.isArray(s) ? s : []);
      } catch (e) {
        setError(String(e.message || e));
      } finally {
        setStopsLoading(false);
      }
    })();
  }, [selectedRoute]);

  const handleCreateRoute = async () => {
    if (!newRouteId || !newRouteName) return setError("routeId and name required");
    try {
      await createRoute({ routeId: newRouteId, name: newRouteName });
      setNewRouteId("");
      setNewRouteName("");
      refreshRoutes();
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (!confirm("Delete route and its stops?")) return;
    try {
      await deleteRoute(routeId);
      if (selectedRoute?.routeId === routeId) setSelectedRoute(null);
      refreshRoutes();
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  const handleCreateStop = async () => {
    const payload = {
      stopId: newStop.stopId,
      routeId: selectedRoute.routeId,
      name_en: newStop.name_en,
      lat: Number(newStop.lat),
      lng: Number(newStop.lng),
      sequence: Number(newStop.sequence),
    };
    try {
      await createStop(payload);
      setNewStop({ stopId: "", name_en: "", lat: "", lng: "", sequence: "" });
      const s = await listStops(selectedRoute.routeId);
      setStops(Array.isArray(s) ? s : []);
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (!confirm("Delete stop?")) return;
    try {
      await deleteStop(stopId);
      const s = await listStops(selectedRoute.routeId);
      setStops(Array.isArray(s) ? s : []);
    } catch (e) {
      setError(String(e.message || e));
    }
  };

  return (
    <div className="gov-shell">
      <GovHeader lastSyncText="Admin Console" backendOk={true} />
      <div className="gov-banner">🛡 Authority Panel — manage routes & stops.</div>

      <main className="gov-main">
        <section className="card left-panel">
          <div className="card-h">
            <div className="h">Routes</div>
            <div className="muted">Create / select</div>
          </div>
          <div className="card-b">
            <div style={{ marginBottom: 10 }}>
              <input className="input" placeholder="Route ID" value={newRouteId} onChange={(e) => setNewRouteId(e.target.value)} />
              <input className="input" placeholder="Route name" value={newRouteName} onChange={(e) => setNewRouteName(e.target.value)} style={{ marginTop: 8 }} />
              <button className="btn" onClick={handleCreateRoute} style={{ marginTop: 8 }}>Create Route</button>
            </div>

            <div className="divider" />

            {routesLoading ? <div className="muted">Loading routes…</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {routes.map((r) => (
                  <div key={r.routeId} className="item" onClick={() => setSelectedRoute(r)} style={{ cursor: "pointer", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <b>{r.routeId}</b>
                      <div className="kv">{r.name}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn" onClick={(e) => { e.stopPropagation(); handleDeleteRoute(r.routeId); }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && <div style={{ color: "#b91c1c", marginTop: 10 }}>{error}</div>}
          </div>
        </section>

        <section className="card map-card">
          <div className="card-h">
            <div className="h">Stops{selectedRoute ? ` — ${selectedRoute.routeId}` : ""}</div>
            <div className="muted">Sequence & coords</div>
          </div>
          <div className="card-b">
            {!selectedRoute ? <div className="muted">Select a route to manage stops</div> : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input className="input" placeholder="Stop ID" value={newStop.stopId} onChange={(e) => setNewStop(v => ({ ...v, stopId: e.target.value }))} />
                  <input className="input" placeholder="Name (EN)" value={newStop.name_en} onChange={(e) => setNewStop(v => ({ ...v, name_en: e.target.value }))} />
                  <input className="input" placeholder="Lat" value={newStop.lat} onChange={(e) => setNewStop(v => ({ ...v, lat: e.target.value }))} />
                  <input className="input" placeholder="Lng" value={newStop.lng} onChange={(e) => setNewStop(v => ({ ...v, lng: e.target.value }))} />
                  <input className="input" placeholder="Sequence" value={newStop.sequence} onChange={(e) => setNewStop(v => ({ ...v, sequence: e.target.value }))} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <button className="btn" onClick={handleCreateStop}>Add Stop</button>
                </div>

                <div className="divider" />

                {stopsLoading ? <div className="muted">Loading stops…</div> : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {stops.map((s) => (
                      <div key={s.stopId} className="item" style={{ alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <b>{s.stopId}</b>
                          <div className="kv">{s.name_en} · seq {s.sequence}</div>
                          <div className="kv">{s.lat}, {s.lng}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn" onClick={() => handleDeleteStop(s.stopId)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="card right-panel">
          <div className="card-h">
            <div className="h">Notes</div>
            <div className="muted">Info</div>
          </div>
          <div className="card-b">
            <div className="muted">Routes and stops changes are protected by admin auth on the backend.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
