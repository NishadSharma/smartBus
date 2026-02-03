export default function GovFooter() {
  return (
    <footer
      style={{
        marginTop: "auto",
        padding: "10px 16px",
        fontSize: 11,
        color: "#6b7280",
        textAlign: "center",
        borderTop: "1px solid #e5e7eb",
        background: "#f9fafb",
      }}
    >
      © {new Date().getFullYear()} Department of Transport, Punjab ·
      This is a prototype system for academic & demonstration purposes only.
    </footer>
  );
}
