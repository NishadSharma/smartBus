export default function TopBar({ title, right }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        zIndex: 999,
        display: "flex",
        gap: 10,
        alignItems: "center",
        justifyContent: "space-between",
        background: "white",
        padding: "10px 12px",
        borderRadius: 10,
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ fontWeight: 800 }}>{title}</div>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{right}</div>
    </div>
  );
}
