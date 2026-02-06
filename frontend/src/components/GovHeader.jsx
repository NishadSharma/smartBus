import { useEffect, useState } from "react";

export default function GovHeader({ lastSyncText, backendOk }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <header className="gov-header">
      <div className="gov-header-row">
        <div className="gov-brand">
          <div className="gov-logo">SB</div>
          <div className="gov-title">
            <div className="dept">Department of Transport</div>
            <div className="app">smartBus — Real-Time Public Transport Tracking</div>
          </div>
        </div>

        <div className="gov-status">
          <div className={`pill ${backendOk ? "ok" : "bad"}`}>
            <span className="status-dot" />
            Service: {backendOk ? "Operational" : "Down"}
          </div>

          <div className="pill">{lastSyncText}</div>
          <div className="pill">Helpline: 1800-XXX-XXXX</div>

          {/* Dark mode toggle */}
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? "🌙 Night" : "☀️ Day"}
          </button>
        </div>
      </div>
    </header>
  );
}
