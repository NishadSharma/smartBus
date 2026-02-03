import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import { getBusEta } from "../api";

export default function BusDetails() {
  const { busId } = useParams();
  const [eta, setEta] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Loading…");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setStatus("Loading…");
        const data = await getBusEta(busId);
        setEta(data);
        setStatus(`Updated: ${new Date().toLocaleTimeString()}`);
      } catch (e) {
        setError(`ETA not available yet: ${e.message}`);
        setStatus("N/A");
      }
    })();
  }, [busId]);

  return (
    <div style={{ padding: 16 }}>
      <TopBar title={`Bus Details — ${busId}`} right={status} />

      <div style={{ marginTop: 70, maxWidth: 720 }}>
        <Link to="/">← Back to map</Link>

        <div style={{ marginTop: 12, padding: 12, background: "white", borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Next Stops & ETA</div>

          {error && <div style={{ color: "crimson", fontSize: 12 }}>{error}</div>}

          {!eta ? (
            <div style={{ opacity: 0.7 }}>Waiting for ETA data…</div>
          ) : (
            <>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Route: <b>{eta.routeId ?? "N/A"}</b>
              </div>

              <ul>
                {(eta.nextStops || []).map((s) => (
                  <li key={s.stopId}>
                    <b>{s.name_en}</b> — ETA: {Math.round(s.etaMinutes)} min
                  </li>
                ))}
              </ul>

              <div style={{ fontSize: 12, opacity: 0.7 }}>
                (ETA v1 is distance/speed based; improves later.)
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
